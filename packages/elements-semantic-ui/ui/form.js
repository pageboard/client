HTMLFormElement.prototype.fill = function(values) {
	var count = 0;
	var elem = null, name, val;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		name = elem.name;
		if (!name) continue;
		count++;
		val = `[${name}]`.fuse(values);
		switch (elem.type) {
		case 'submit':
			break;
		case 'radio':
		case 'checkbox':
			if (!Array.isArray(val)) val = [val];
			elem.checked = val.some(function(str) {
				return str.toString() == elem.value;
			});
			break;
		case 'select-multiple':
			elem.fill(val);
			break;
		case 'textarea':
			elem.innerText = val;
			break;
		default:
			if (elem.fill) {
				elem.fill(val);
			} else {
				elem.value = val;
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
	Array.from(document.forms).forEach(function(form) {
		if (form.closest('[contenteditable]')) return;
		if (form.method != "get") return;
		var loc = Page.parse(form.action);
		// do not fill form from current state if form does not submit to current pathname
		if (loc.pathname != state.pathname || Page.sameDomain(loc, state) == false) return;
		form.fill(state.query);
	});
});

Page.setup(function(state) {
	document.body.addEventListener('submit', formHandler, false);
	document.body.addEventListener('input', inputHandler, false);
	document.body.addEventListener('change', inputHandler, false);

	var ignoreInputChange = false;
	function inputHandler(e) {
		if (e.type == "input") {
			ignoreInputChange = true;
		} else if (e.target && e.target.matches('input') && ignoreInputChange) {
			return;
		}
		formHandler(e);
	}

	var formGet = Pageboard.debounce(function(form, submit) {
		ignoreInputChange = false;
		var loc = Page.parse(form.action);
		Object.assign(loc.query, formToQuery(form));
		if (Page.samePathname(loc, state)) {
			loc.query = Object.assign({}, state.query, loc.query);
		} else if (!submit) {
			// do not automatically submit form if form pathname is not same as current pathname
			return;
		}
		form.classList.add('loading');
		return state.push(loc).then(function() {
			return ""; // empty statusText
		}).catch(function(err) {
			if (err.status == 404) return 'warning';
			else return 'error';
		}).then(function(statusText) {
			form.classList.remove('loading');
			if (statusText) form.classList.add(statusText);
		});
	}, 300);

	function formPost(form, submit) {
		if (!submit) return;
		form.classList.add('loading');
		return Promise.all(Array.prototype.filter.call(form.elements, function(node) {
			return node.type == "file";
		}).map(function(input) {
			return input.closest('element-input-file').upload();
		})).then(function() {
			return Pageboard.fetch(form.method, form.action, formToQuery(form));
		}).then(function() {
			return "success";
		}).catch(function(err) {
			if (err.status == 404) return 'warning';
			else return 'error';
		}).then(function(statusText) {
			form.classList.remove('loading');
			if (statusText) {
				var query = Object.assign({}, state.query);
				query[form.id] = statusText;
				return state.push({query: query});
			}
		});
	}

	function formHandler(e) {
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		if (form.closest('[contenteditable]')) return;
		var submit = e.type == "submit";
		if (submit) e.preventDefault();
		form.classList.remove('error', 'warning', 'success');
		if (form.matches('.loading')) return;
		if (form.method == "get") formGet(form, submit);
		else if (form.method == "post") formPost(form, submit);
		else console.error("Unsupported form method", form.method);
	}

	function formToQuery(form) {
		var fd = new FormData(form);
		var query = {};
		fd.forEach(function(val, key) {
			if (val == null || val == "") {
				if (form.querySelector(`[name="${key}"]`).required) {
					val = undefined;
				}
			}
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
