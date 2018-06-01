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
	var flats = asPaths(values, {});
	var count = 0;
	var elem = null, name, val;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		name = elem.name;
		if (!name) continue;
		count++;
		val = flats[name];
		switch (elem.type) {
			case 'submit':
			break;
			case 'radio':
			case 'checkbox':
				if (val == null) val = [''];
				else if (!Array.isArray(val)) val = [val];
				elem.checked = val.some(function(str) {
					return str.toString() == elem.value;
				});
			break;
			case 'select-multiple':
				if (val) elem.fill(val);
			break;
			case 'textarea':
				if (val) elem.innerText = val;
			default:
				if (val) {
					if (elem.fill) {
						elem.fill(val);
					} else {
						elem.value = val;
					}
				}
			break;
		}
	}
	return count;
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

HTMLInputElement.prototype.fill = function(val) {
	var subFill = this[this.type + 'Fill'];
	if (subFill) return subFill.call(this, val);
	else this.value = val;
};

HTMLInputElement.prototype.reset = function() {
	var subReset = this[this.type + 'Reset'];
	if (subReset) return subReset.call(this);
	else this.value = "";
};

Page.patch(function(state) {
	var proms = [];
	Array.from(document.forms).forEach(function(form) {
		if (form.dataset.fill != "true") return;
		if (form.matches('.warning')) {
			form.classList.remove('warning');
			form.enable();
		}
		var fillCount = form.fill(state.query);
		var fetch = form.querySelector('[data-fetch]');
		if (!fetch || fillCount <= 1 || !fetch.name || !fetch.value) return;
		var _id = form.querySelector('input[name="_id"]');
		if (!_id || !_id.value) {
			console.warn("missing input _id");
			return;
		}
		var obj = {
			_id: _id.value
		};
		obj[fetch.name] = fetch.value;
		proms.push(Pageboard.fetch('get', '/.api/form', obj).then(function(block) {
			form.fill(block.data);
		}).catch(function(err) {
			console.error(err);
			form.classList.add('warning');
			form.disable();
		}));
	});
	return Promise.all(proms);
});

Page.setup(function(state) {
	document.body.addEventListener('submit', formHandler, false);
	document.body.addEventListener('input', inputHandler, false);
	document.body.addEventListener('change', inputHandler, false);

	var toInput, ignoreInputChange = false;
	function inputHandler(e) {
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		if (form.dataset.live != "true") return;
		if (e.type == "input") {
			ignoreInputChange = true;
		} else if (e.target.matches('input') && ignoreInputChange) {
			return;
		}
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
			var loc = Object.assign(Page.parse(form.action), {
				query: formToQuery(form, true)
			});
			p = Page.push(loc);
		} else {
			p = Promise.all(Array.prototype.filter.call(form.elements, function(node) {
				return node.type == "file";
			}).map(function(input) {
				return input.closest('element-input-file').upload();
			})).then(function() {
				return Pageboard.fetch(form.method, form.action, formToQuery(form));
			}).then(function(data) {
				form.classList.add('success');
				if (data.redirect) {
					return Page.push(data.redirect);
				} else if (form.closest('[block-type="query"]')) {
					return Page.push(Page.state);
				}
			});
		}
		p.catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
		});
	}

	function formToQuery(form, noUnderscore) {
		var fd = new FormData(form);
		var query = {};
		fd.forEach(function(val, key) {
			if (val == null || val == "") return;
			if (noUnderscore && key[0] == "_") return;
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
		field.classList.toggle('error', !remove && !validity.valid);
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
