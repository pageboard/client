class HTMLCustomFormElement extends HTMLFormElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	init() {
		this.getMethodLater = Pageboard.debounce(this.getMethod, 300);
	}
	patch(state) {
		if (this.isContentEditable) return;
		if (this.method != "get") {
			this.restore(state.scope);
		} else {
			this.fill(state.query, state).forEach((name) => {
				state.vars[name] = true;
			});
		}
	}
	paint(state) {
		// ?submit=<name> for auto-submit
		var name = state.query.submit;
		if (!name || name != this.name) return;
		state.vars.submit = true;
		state.finish(() => {
			var e = document.createEvent('HTMLEvents');
			e.initEvent('submit', true, true);
			this.dispatchEvent(e);
		});
	}
	read(withDefaults) {
		var fd = new FormData(this);
		var query = {};
		fd.forEach(function (val, key) {
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

		this.elements.forEach(function (node) {
			if (node.name == null || node.name == "" || node.type == "button") return;
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
	fill(query, scope) {
		// workaround for merging arrays
		const tagList = "element-fieldset-list";
		const FieldSet = VirtualHTMLElement.define(tagList);
		this.querySelectorAll(tagList).forEach((node) => {
			if (!node.fill) Object.setPrototypeOf(node, FieldSet.prototype);
			node.fill(query, scope);
		});
		const vars = [];
		this.elements.forEach(function (elem) {
			const name = elem.name;
			if (!name) return;
			if (Object.prototype.hasOwnProperty.call(query, name) && !vars.includes(name)) vars.push(name);
			const val = query[name];
			const str = val == null ? "" : (typeof val == "object" ? val : val.toString());
			switch (elem.type) {
				case 'submit':
					break;
				case 'radio':
				case 'checkbox':
					elem.checked = (Array.isArray(val) ? val : [str]).some(function (str) {
						return str.toString() == elem.value;
					});
					break;
				case 'select-multiple':
					elem.fill(str);
					break;
				case 'textarea':
					elem.innerText = str;
					break;
				case 'hidden':
					if (val !== undefined) elem.value = str;
					break;
				case 'button':
					break;
				default:
					if (elem.fill) {
						elem.fill(str);
					} else {
						elem.value = str;
					}
					break;
			}
		});
		return vars;
	}
	save() {
		this.elements.forEach(function (node) {
			if (node.save) node.save();
		});
	}
	reset() {
		this.elements.forEach(function (node) {
			if (node.reset) node.reset();
		});
	}
	backup() {
		if (!this.action) return;
		window.sessionStorage.setItem(
			this.action,
			JSON.stringify(this.read(true))
		);
	}
	restore(scope) {
		if (!this.action) return;
		const str = window.sessionStorage.getItem(this.action);
		if (str == null) return;
		try {
			this.fill(JSON.parse(str), scope);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn(err);
			this.forget();
		}
	}
	forget() {
		if (!this.action) return;
		window.sessionStorage.removeItem(this.action);
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
		if (fn) {
			fn.call(this, e, state);
		} else {
			// eslint-disable-next-line no-console
			console.error("Unsupported form method", this.method);
		}
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
		var redirect = this.getAttribute('redirection');
		var loc = Page.parse(redirect);
		Object.assign(loc.query, form.read(false));
		if (Page.samePathname(loc, state)) {
			loc.query = Object.assign({}, state.query, loc.query);
		}
		var status = 200;
		return state.push(loc).catch(function (err) {
			if (err.status != null) status = err.status;
			else status = 0;
		}).then(function () {
			var statusClass = `[n|statusClass]`.fuse({ n: status });
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
		return Promise.all(Array.prototype.filter.call(form.elements, function (node) {
			return node.type == "file";
		}).map(function (input) {
			return input.closest('element-input-file').upload();
		})).then(function () {
			data.$query = state.query;
			data.$request = form.read(true);
			form.disable();
			return Pageboard.fetch(form.method, Page.format({
				pathname: form.getAttribute('action'),
				query: data.$query
			}), data.$request);
		}).catch(function (err) {
			return err;
		}).then(function (res) {
			if (res && res.grants) state.data.$grants = res.grants;
			state.scope.$response = res;
			form.enable();

			form.classList.remove('loading');
			// messages shown inside form, no navigation
			var statusClass = `[n|statusClass]`.fuse({ n: res.status });
			if (statusClass) form.classList.add(statusClass);

			const statusName = HTMLCustomFormElement.statusName(res.status);
			let redirect = form.getAttribute(statusName);
			if (statusName == "success") {
				form.forget();
				form.save();
				if (!redirect && form.closest('element-template')) {
					redirect = Page.format(state);
				}
			}

			if (!redirect) return;

			data.$response = res;
			data.$status = res.status;
			redirect = redirect.fuse(data, state.scope);
			if (!redirect) {
				if (res.granted) redirect = Page.format(state);
				else return;
			}
			if (redirect && statusName != "success") {
				form.backup();
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
			document.querySelectorAll('element-template').forEach(function (node) {
				delete node.dataset.query;
			});
			return state.push(loc, {
				vary: vary
			});
		});
	}
}
window.HTMLCustomFormElement = HTMLCustomFormElement;

HTMLCustomFormElement.statusName = function (code) {
	if (code >= 200 && code < 400) return 'success';
	else if (code == 404) return 'notfound';
	else if (code == 401 || code == 403) return 'unauthorized';
	else if (code == 400) return 'badrequest';
	else return 'error';
};

/* these methods must be available even on non-upgraded elements */
HTMLFormElement.prototype.enable = function () {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = false;
		if (elem.hasAttribute('disabled')) elem.removeAttribute('disabled');
	}
};
HTMLFormElement.prototype.disable = function () {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = true;
	}
};

Page.ready(function () {
	VirtualHTMLElement.define(`element-form`, HTMLCustomFormElement, 'form');
});


HTMLSelectElement.prototype.fill = function (values) {
	var opt;
	if (!Array.isArray(values)) values = [values];
	for (var i = 0; i < this.options.length; i++) {
		opt = this.options[i];
		opt.selected = values.indexOf(opt.value) > -1;
	}
};
HTMLSelectElement.prototype.reset = function () {
	for (var i = 0; i < this.options.length; i++) this.options[i].selected = false;
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

HTMLTextAreaElement.prototype.reset = function () {
	this.value = this.defaultValue;
};

HTMLTextAreaElement.prototype.save = function () {
	this.defaultValue = this.value;
};

Object.defineProperty(HTMLInputElement.prototype, 'defaultValue', {
	configurable: true,
	enumerable: true,
	get: function () {
		if (this.form && this.form.method == "get") return '';
		else return this.getAttribute('value');
	},
	set: function (val) {
		this.setAttribute('value', val);
	}
});

Page.setup(function (state) {
	// https://daverupert.com/2017/11/happier-html5-forms/
	Page.connect({
		captureBlur: function (e, state) {
			blurHandler(e, false);
		},
		captureFocus: function (e, state) {
			var el = e.target;
			if (!el.matches || !el.matches('input,textarea,select')) return;
			if (e.relatedTarget && e.relatedTarget.type == "submit") return;
			updateClass(el.closest('.field') || el, el.validity, true);
		},
		captureInvalid: function (e, state) {
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

Page.ready(function (state) {
	var filters = state.scope.$filters;

	function linearizeValues(query, obj = {}, prefix) {
		Object.keys(query).forEach(function(key) {
			const val = query[key];
			if (prefix) key = prefix + '.' + key;
			if (val === undefined) return;
			if (val == null) obj[key] = val;
			else if (typeof val == "object") linearizeValues(val, obj, key);
			else obj[key] = val;
		});
		return obj;
	}
	filters.form = function (val, what, action) {
		var form = what.parent.closest('form');
		if (!form) {
			// eslint-disable-next-line no-console
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
			} else if (typeof val == "object") {
				var values = val;
				if (val.id && val.data) {
					// old way
					values = Object.assign({}, val.data);
					Object.keys(val).forEach((key) => {
						if (key != "data") values['$' + key] = val[key];
					});
				} else {
					// new way
				}
				HTMLCustomFormElement.prototype.fill.call(form, linearizeValues(values), state.scope);
			}
		}
		return val;
	};
});
