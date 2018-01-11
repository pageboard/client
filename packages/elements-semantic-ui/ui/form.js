HTMLFormElement.prototype.fill = function(values) {
	var elem = null, val;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		if (!elem.name) continue;
		val = values[elem.name];
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
			default:
				if (val) elem.value = val;
		}
	}
};

HTMLSelectElement.prototype.fill = function(values) {
	var opt;
	for (var i = 0; i < this.options.length; i++) {
		opt = this.options[i];
		opt.selected = values.indexOf(opt.value) > -1;
	}
};


Page.patch(function(state) {
	var proms = [];
	Array.from(document.forms).forEach(function(form) {
		var method = form.method && form.method.toLowerCase() || null;
		if (method == "get") {
			form.fill(state.query);
		} else if (method == "post") {
			var name = "id";
			// TODO
			// var formName = form.getAttribute('name');
			// if (formName) name = `${formName}.${name}`;
			var id = state.query[name];
			if (!id) return;
			var input = form.querySelector('input[type="hidden"][name="id"]');
			if (!input) {
				return;
			}
			var parent = form.querySelector('input[type="hidden"][name="_parent"]');
			if (!parent || !parent.value) {
				console.warn("form has no parent id");
				return;
			}
			parent = parent.value;
			proms.push(fetchAction('get', '/.api/form', {
				_parent: parent,
				id: id
			}).then(function(block) {
				form.fill(block.data);
			}).catch(function(err) {
				console.error(err);
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
		var formData = new FormData(form);
		var query = formDataToQuery(formData);
		var p;
		if (form.method.toLowerCase() == "get") {
			p = Page.push({pathname: form.action, query: query});
		} else p = fetchAction(form.method, form.action, query).then(function(data) {
			form.classList.add('success');
			if (data.redirect) return Page.push(redirect);
		});
		p.catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
		});
	}

	function fetchAction(method, url, data) {
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
	}

	function formDataToQuery(formData) {
		var query = {};
		formData.forEach(function(val, key) {
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
