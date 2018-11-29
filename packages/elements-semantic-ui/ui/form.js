class HTMLCustomFormElement extends HTMLFormElement {
	init() {
		this.getMethod = Pageboard.debounce(this.getMethod, 300);
	}
	patch(state) {
		if (state.scope.$write) return;
		if (this.method != "get") return;
		// do not fill form from current state if form does not submit to current pathname
		if (!Page.samePathname(state, this.action)) return;
		this.fill(state.query);
	}
	disable() {
		var elem = null;
		for (var i = 0; i < this.elements.length; i++) {
			elem = this.elements[i];
			elem.disabled = true;
		}
	}
	enable() {
		var elem = null;
		for (var i = 0; i < this.elements.length; i++) {
			elem = this.elements[i];
			elem.disabled = false;
			if (elem.hasAttribute('disabled')) elem.removeAttribute('disabled');
		}
	}
	read() {
		var fd = new FormData(this);
		var query = {};
		fd.forEach(function(val, key) {
			if (val == null || val == "") {
				if (this.querySelector(`[name="${key}"]`).required) {
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
		}, this);
		return query;
	}
	fill(values) {
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
	}
	handleSubmit(e, state) {
		if (state.scope.$write) return;
		var submit = e.type == "submit";
		if (submit) e.preventDefault();
		this.classList.remove('error', 'warning', 'success');
		if (this.matches('.loading')) return;
		var fn = this[this.method + 'Method'];
		if (fn) fn.call(this, state, submit);
		else console.error("Unsupported form method", this.method);
	}
	handleInput(e, state) {
		if (e.type == "input") {
			this.ignoreInputChange = true;
		} else if (e.target && e.target.matches('input') && this.ignoreInputChange) {
			return;
		}
		this.handleSubmit(e, state);
	}
	handleChange(e, state) {
		this.handleInput(e, state);
	}
	getMethod(state, submit) {
		this.ignoreInputChange = false;
		var form = this;
		var loc = Page.parse(form.action);
		Object.assign(loc.query, form.read());
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
	}
	postMethod(state, submit) {
		if (!submit) return;
		var form = this;
		form.classList.add('loading');
		return Promise.all(Array.prototype.filter.call(form.elements, function(node) {
			return node.type == "file";
		}).map(function(input) {
			return input.closest('element-input-file').upload();
		})).then(function() {
			return Pageboard.fetch(form.method, form.action, form.read());
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
}

Page.setup(function() {
	HTMLCustomElement.define(`element-form`, HTMLCustomFormElement, 'form');
});


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

Page.setup(function(state) {
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
