class HTMLCustomFormElement extends HTMLFormElement {
	static get defaults() {
		return {
			action: null,
			redirection: null
		};
	}
	init() {
		this.getMethodLater = Pageboard.debounce(this.getMethod, 300);
	}
	patch(state) {
		if (this.isContentEditable) return;
		if (this.method != "get") return;
		this.fill(state.query).forEach((name) => {
			state.vars[name] = true;
		});
	}
	read(withDefaults) {
		var fd = new FormData(this);
		var query = {};
		fd.forEach(function(val, key) {
			if (val == null || val == "") {
				var cur = Array.from(this.querySelectorAll(`[name="${key}"]`)).pop();
				if (cur.required == false) {
					val = undefined;
				} else {
					val = null;
				}
			}
			var old = query[key];
			if (old !== undefined) {
				if (!Array.isArray(old)) {
					query[key] = [old];
				}
				if (val !== undefined) query[key].push(val);
			} else {
				query[key] = val;
			}
		}, this);

		this.elements.forEach(function(node) {
			if (node.name == null || node.name == "") return;
			var val = node.value;
			if (val == "") val = null;
			if (node.type == "radio") {
				if (!withDefaults && node.checked == node.defaultChecked && query[node.name] == val) {
					query[node.name] = undefined;
				}
			} else if (node.type == "checkbox") {
				if (!(node.name in query)) {
					if (!withDefaults) query[node.name] = undefined;
				}
			} else if (node.type == "hidden") {
				// always include them
			} else {
				var defVal = node.defaultValue;
				if (defVal == "") defVal = null;
				if (!withDefaults && query[node.name] == defVal) {
					query[node.name] = undefined;
				}
			}
			if (query[node.name] === undefined && withDefaults) {
				query[node.name] = null;
			}
		});
		var btn = document.activeElement;
		if (btn && btn.type == "submit" && btn.name && query[btn.name] === undefined) {
			query[btn.name] = btn.value;
		}
		return query;
	}
	fill(values) {
		// cheap flattening
		values = Page.parse(Page.format({query:values})).query;
		var vars = [];
		var elem = null, name, val;
		for (var i = 0; i < this.elements.length; i++) {
			elem = this.elements[i];
			name = elem.name;
			if (!name) continue;
			if (Object.prototype.hasOwnProperty.call(values, name) && !vars.includes(name)) vars.push(name);
			val = values[name];
			if (val == null) val = '';
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
			case 'hidden':
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
		return vars;
	}
	save() {
		this.elements.forEach(function(node) {
			if (node.save) node.save();
		});
	}
	reset() {
		this.elements.forEach(function(node) {
			if (node.reset) node.reset();
		});
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		this.classList.remove('error', 'warning', 'success');
		if (this.matches('.loading')) return;
		if (e.type != "submit" && this.querySelector('[type="submit"]')) return;
		var fn = this[this.method + 'Method'];
		if (e.type == "input" && (!e.target || !["radio", "checkbox"].includes(e.target.type))) {
			fn = this[this.method + 'MethodLater'] || fn;
		}
		if (fn) fn.call(this, e, state);
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
	getMethod(e, state) {
		this.ignoreInputChange = false;
		var form = this;
		var redirect = this.options.redirection;
		var loc = Page.parse(redirect);
		Object.assign(loc.query, form.read(false));
		if (Page.samePathname(loc, state)) {
			loc.query = Object.assign({}, state.query, loc.query);
		}
		var status = 200;
		return state.push(loc).catch(function(err) {
			if (err.status != null) status = err.status;
			else status = 0;
		}).then(function() {
			var statusClass = `[n|statusClass]`.fuse({n: status});
			if (statusClass) form.classList.add(statusClass);
		});
	}
	postMethod(e, state) {
		if (e.type != "submit") return;
		var form = this;
		form.classList.add('loading');
		var data = {
			$query: state.query
		};
		return Promise.all(Array.prototype.filter.call(form.elements, function(node) {
			return node.type == "file";
		}).map(function(input) {
			return input.closest('element-input-file').upload();
		})).then(function() {
			data.$query = state.query;
			data.$request = form.read(true);
			form.disable();
			return Pageboard.fetch(form.method, Page.format({
				pathname: form.options.action,
				query: data.$query
			}), data.$request);
		}).catch(function(err) {
			return err;
		}).then(function(res) {
			if (res && res.grants) state.data.$grants = res.grants;
			state.scope.$response = res;
			form.classList.remove('loading');
			var statusClass = `[n|statusClass]`.fuse({n: res.status});
			if (statusClass) form.classList.add(statusClass);
			form.enable();
			if (res.status < 200 || res.status >= 400) return;
			form.save();
			data.$response = res;
			data.$status = res.status;
			var redirect = form.options.redirection;
			if (redirect) redirect = redirect.fuse(data, state.scope);
			if (!redirect) {
				if (res.granted) redirect = Page.format(state);
				else return;
			}
			var loc = Page.parse(redirect);
			var vary = false;
			if (Page.samePathname(loc, state)) {
				if (res.granted) {
					vary = true;
				} else {
					vary = "patch";
					// keep current query
					// redirect can use |query|unset:name filter to set a query param to undefined
					loc.query = Object.assign({}, state.query, loc.query);
				}
				state.data.$vary = vary;
			}
			document.querySelectorAll('element-template').forEach(function(node) {
				delete node.dataset.query;
			});
			return state.push(loc, {
				vary: vary
			});
		});
	}
}
window.HTMLCustomFormElement = HTMLCustomFormElement;

/* these methods must be available even on non-upgraded elements */
HTMLFormElement.prototype.enable = function() {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = false;
		if (elem.hasAttribute('disabled')) elem.removeAttribute('disabled');
	}
};
HTMLFormElement.prototype.disable = function() {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = true;
	}
};

Page.ready(function() {
	VirtualHTMLElement.define(`element-form`, HTMLCustomFormElement, 'form');
});


HTMLSelectElement.prototype.fill = function(values) {
	var opt;
	for (var i = 0; i < this.options.length; i++) {
		opt = this.options[i];
		opt.selected = values.indexOf(opt.value) > -1;
	}
};

HTMLInputElement.prototype.fill = function (val) {
	if (val == null) val = "";
	if (this.type == "radio" || this.type == "checkbox") {
		this.checked = val;
	} else {
		this.value = val;
	}
};

HTMLInputElement.prototype.reset = function () {
	if (this.type == "radio" || this.type == "checkbox") {
		this.fill(this.defaultChecked);
	} else {
		this.fill(this.defaultValue);
	}
};

HTMLInputElement.prototype.save = function () {
	if (this.type == "radio" || this.type == "checkbox") {
		this.defaultChecked = this.checked;
	} else {
		this.defaultValue = this.value;
	}
};

HTMLTextAreaElement.prototype.reset = function() {
	this.value = this.defaultValue;
};

HTMLTextAreaElement.prototype.save = function() {
	this.defaultValue = this.value;
};

Object.defineProperty(HTMLInputElement.prototype, 'defaultValue', {
	configurable: true,
	enumerable: true,
	get: function() {
		if (this.form.method == "get") return '';
		else return this.getAttribute('value');
	},
	set: function(val) {
		this.setAttribute('value', val);
	}
});

Page.setup(function(state) {
	// https://daverupert.com/2017/11/happier-html5-forms/
	Page.connect({
		captureBlur: function(e, state) {
			blurHandler(e, false);
		},
		captureFocus: function(e, state) {
			var el = e.target;
			if (!el.matches || !el.matches('input,textarea,select')) return;
			if (e.relatedTarget && e.relatedTarget.type == "submit") return;
			updateClass(el.closest('.field') || el, el.validity, true);
		},
		captureInvalid: function(e, state) {
			// e.preventDefault(); // show native ui
			blurHandler(e, true);
		}
	}, document);

	function updateClass(field, validity, remove) {
		for (var key in validity) {
			if (key == "valid") continue;
			var has = validity[key];
			field.classList.toggle(key, !remove && has);
		}
		field.classList.toggle('error', !remove && !validity.valid);
	}
	function blurHandler(e, checked) {
		var el = e.target;
		if (!el.matches || !el.matches('input,textarea,select')) return;
		if (!checked) el.checkValidity();
		updateClass(el.closest('.field') || el, el.validity);
	}
});

Page.ready(function(state) {
	var filters = state.scope.$filters;
	filters.form = function(val, what, action) {
		var form = what.parent.closest('form');
		if (!form) {
			console.warn("No parent form found");
			return val;
		}
		if (action == "toggle") {
			action = val ? "enable" : "disable";
		}
		if (action == "enable") {
			HTMLCustomFormElement.prototype.enable.call(form);
		} else if (action == "disable") {
			HTMLCustomFormElement.prototype.disable.call(form);
		} else if (action == "fill") {
			if (val == null) {
				form.reset();
			} else if (typeof val == "object" && val.id) {
				var meta = Object.assign({}, val.data);
				Object.keys(val).forEach((key) => {
					if (key != "data") meta['$' + key] = val[key];
				});
				HTMLCustomFormElement.prototype.fill.call(form, meta);
			}
		}
		return val;
	};
});
