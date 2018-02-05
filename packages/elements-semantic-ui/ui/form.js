HTMLFormElement.prototype.fill = function(values) {
	function asPaths(obj, ret, pre) {
		if (!ret) ret = {};
		Object.keys(obj).forEach(function(key) {
			var val = obj[key];
			var cur = `${pre || ""}${key}`;
			if (val == null || Array.isArray(val) || typeof val != "object") {
				ret[cur] = val;
			} else if (typeof val == "object") {
				asPaths(val, ret, cur + '.');
			}
		});
		return ret;
	}
	var elem = null, val;
	var flats = asPaths(values, {});

	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		if (!elem.name) continue;
		val = flats[elem.name];
		switch (elem.type) {
			case 'submit':
			break;
			case 'radio':
				elem.checked = val === elem.value;
			break;
			case 'checkbox':
				elem.checked = (Array.isArray(val) ? val : [val]).some(function(val) {
					return val === elem.value;
				});
			break;
			case 'select-multiple':
				if (val) elem.fill(val);
			break;
			case 'file':
				if (val) elem.setAttribute("value", val);
			break;
			default:
				if (val) elem.value = val;
		}
	}
};

HTMLFormElement.prototype.disable = function() {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = true;
	}
};

HTMLFormElement.prototype.enable = function() {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = false;
		if (elem.hasAttribute('disabled')) elem.removeAttribute('disabled');
	}
};

HTMLSelectElement.prototype.fill = function(values) {
	var opt;
	for (var i = 0; i < this.options.length; i++) {
		opt = this.options[i];
		opt.selected = values.indexOf(opt.value) > -1;
	}
};

HTMLFormElement.fetch = function(method, url, data) {
	var fetchOpts = {
		method: method,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	};
	if (/^get$/i.test(method)) {
		url = Page.format(Object.assign(Page.parse(url), {query: data}));
	} else {
		fetchOpts.body = JSON.stringify(data);
	}

	// 1. get data and submit json to "action"
	return fetch(url, fetchOpts).then(function(res) {
		if (res.status >= 400) throw new Error(res.statusText);
		return res.json();
	});
};


Page.patch(function(state) {
	var proms = [];
	Array.from(document.forms).forEach(function(form) {
		var method = form.method && form.method.toLowerCase() || null;
		if (method == "get") {
			form.fill(state.query);
		} else if (method == "post") {
			if (form.matches('.warning')) {
				form.classList.remove('warning');
				form.enable();
			}
			var fillName = form.dataset.fill;
			if (!fillName) return;
			var id = state.query[fillName];
			if (!id) return;
			var input = form.querySelector('input[type="hidden"][name="_id"]');
			var parent = form.querySelector('input[type="hidden"][name="_parent"]');
			if (!id || !parent || !parent.value) {
				console.warn("form has missing inputs");
				return;
			}
			parent = parent.value;
			input.value = id;
			proms.push(HTMLFormElement.fetch('get', '/.api/form', {
				_parent: parent,
				id: id
			}).then(function(block) {
				form.fill(block.data);
			}).catch(function(err) {
				console.error(err);
				form.classList.add('warning');
				form.disable();
			}));
		}
	});
	return Promise.all(proms);
});

Page.setup(function(state) {
	document.body.addEventListener('submit', formHandler, false);
	document.body.addEventListener('input', inputHandler, false);
	document.body.addEventListener('change', inputHandler, false);

	var toInput;
	function inputHandler(e) {
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		if (form.dataset.live != "true") return;
		if (toInput) clearTimeout(toInput);
		toInput = setTimeout(function() {
			toInput = null;
			formHandler(e);
		}, 300);
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
	function formHandler(e) {
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		e.preventDefault();
		if (form.matches('.loading')) return;
		form.classList.remove('error', 'success');
		form.classList.add('loading');
		var p;
		if (form.method.toLowerCase() == "get") {
			p = Page.push(Object.assign(Page.parse(form.action), {
				query: formToQuery(form)
			}));
		} else {
			p = Promise.all(Array.prototype.filter.call(form.elements, function(node) {
				return node.type == "file";
			}).map(function(input) {
				return input.closest('element-input-file').upload();
			})).then(function() {
				return HTMLFormElement.fetch(form.method, form.action, formToQuery(form));
			}).then(function(data) {
				form.classList.add('success');
				if (data.redirect) return Page.push(redirect);
			});
		}
		p.catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
		});
	}

	function formToQuery(form) {
		var fd = new FormData(form);
		var query = {};
		fd.forEach(function(val, key) {
			var old = query[key];
			if (old !== undefined) {
				if (!Array.isArray(old)) {
					query[key] = [old];
				}
				query[key].push(val);
			} else {
				query[key] = val;
			}
		});
		return query;
	}

	// https://daverupert.com/2017/11/happier-html5-forms/
	document.body.addEventListener('blur', blurHandler, true);
	document.body.addEventListener('focus', focusHandler, true);
	document.body.addEventListener('invalid', invalidHandler, true);

	function updateClass(field, validity, remove) {
		for (var key in validity) {
			if (key == "valid") continue;
			var has = validity[key];
			field.classList.toggle(key, !remove && has);
		}
		field.classList.toggle('error', !validity.valid);
	}
	function invalidHandler(e) {
		// e.preventDefault(); // disable when we have proper messages
		blurHandler(e, true);
	}
	function blurHandler(e, checked) {
		var el = e.target;
		if (!e.target.matches('input,textarea,select')) return;
		if (!checked) el.checkValidity();
		updateClass(el.closest('.field') || el, el.validity);
	}
	function focusHandler(e) {
		var el = e.target;
		if (!el.matches('input,textarea,select')) return;
		updateClass(el.closest('.field') || el, el.validity, true);
	}
});
