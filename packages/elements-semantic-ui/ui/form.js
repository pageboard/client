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
	var debouncedHandler = Pageboard.debounce(formHandler, 300);
	document.body.addEventListener('submit', debouncedHandler, false);
	document.body.addEventListener('input', inputHandler, false);
	document.body.addEventListener('change', inputHandler, false);

	var ignoreInputChange = false;
	function inputHandler(e) {
		if (e.type == "input") {
			ignoreInputChange = true;
		} else if (e.target.matches('input') && ignoreInputChange) {
			return;
		}
		debouncedHandler(e);
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
	function formHandler(e) {
		ignoreInputChange = false;
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		if (form.closest('[contenteditable]')) return;
		e.preventDefault();
		if (form.matches('.loading')) return;
		form.classList.remove('error', 'warning', 'success');
		form.classList.add('loading');
		var p;
		if (form.method == "get") {
			var loc = Page.parse(form.action);
			Object.assign(loc.query, formToQuery(form));

			if (loc.pathname == state.pathname && Page.sameDomain(loc, state)) {
				loc.query = Object.assign({}, state.query, loc.query);
			} else if (e.type != "submit") {
				// do not automatically submit form if form pathname is not same as current pathname
				return;
			}
			p = Page.push(loc).then(function() {
				return ""; // empty state
			});
		} else {
			if (e.type != "submit") return;
			p = Promise.all(Array.prototype.filter.call(form.elements, function(node) {
				return node.type == "file";
			}).map(function(input) {
				return input.closest('element-input-file').upload();
			})).then(function() {
				return Pageboard.fetch(form.method, form.action, formToQuery(form));
			}).then(function() {
				return "success";
			});
		}
		p.catch(function(err) {
			if (err.status == 404) return 'warning';
			else return 'error';
		}).then(function(state) {
			form.classList.remove('loading');
			if (!state) return;
			if (form.method == "get") {
				form.classList.add(state);
			} else {
				Page.state.query[form.id] = state;
				return Page.push(Page.state);
			}
		});
	}

	function formToQuery(form) {
		var fd = new FormData(form);
		var query = {};
		fd.forEach(function(val, key) {
			if (val == null || val == "") return;
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
