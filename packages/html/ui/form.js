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
			// ?submit=<name> for auto-submit
			const name = state.query.submit;
			if (name && name == this.name) {
				state.vars.submit = true;
			}
			const vars = state.templatesQuery(this) || {};
			for (const [key, val] of Object.entries(vars)) {
				this.setAttribute('data-' + key, val);
			}
			this.restore(state.scope);
		} else {
			for (const name of this.fill(state.query, state.scope)) {
				state.vars[name] = true;
			}
		}
	}
	paint(state) {
		// ?submit=<name> for auto-submit
		const name = state.query.submit;
		if (!name || name != this.name) return;
		// make sure to not resubmit in case of self-redirection
		delete state.query.submit;
		state.finish(() => {
			if (state.status != 200) return;
			this.dispatchEvent(new Event('submit', {
				bubbles: true,
				cancelable: true
			}));
		});
	}
	read(withDefaults = false) {
		const fd = new FormData(this);
		const query = {};
		fd.forEach((val, key) => {
			const cur = this.querySelectorAll(`[name="${key}"]`).slice(-1).pop();
			if (cur.type == "file") {
				val = cur.value;
			}
			if (val == "") val = null;
			// build array-like values
			const old = query[key];
			if (old !== undefined) {
				if (!Array.isArray(old)) {
					query[key] = old == null ? [] : [old];
				}
				if (val !== undefined) query[key].push(val);
			} else {
				query[key] = val;
			}
		});

		// withDefaults: keep value if equals to its default
		// else unset value
		for (const node of this.elements) {
			const { name, type } = node;
			if (name == null || name == "" || type == "button") {
				continue;
			}
			let val = node.value;
			if (val == "") val = null;
			let defVal = node.defaultValue;
			if (defVal == "") defVal = null;

			switch (type) {
				case "radio":
					if (!withDefaults && node.checked == node.defaultChecked) {
						if (query[name] == val) {
							query[name] = undefined;
						}
					}
					break;
				case "checkbox":
					if (!withDefaults) {
						if (!(name in query)) {
							query[name] = undefined;
						}
					}
					break;
				case "hidden":
					break;
				default:
					if (withDefaults) {
						if (query[name] === undefined) {
							query[name] = defVal;
						}
					} else if (val === defVal) {
						query[name] = node.required ? null : undefined;
					}
			}
		}
		// FIXME use e.submitter polyfill when available
		// https://github.com/Financial-Times/polyfill-library/issues/1111
		const btn = document.activeElement;
		if (btn && btn.type == "submit" && btn.name && btn.value) {
			query[btn.name] = btn.value;
		}
		return query;
	}
	fill(query, scope) {
		// workaround for merging arrays
		const tagList = "element-fieldset-list";
		const FieldSet = VirtualHTMLElement.define(tagList);
		for (const node of this.querySelectorAll(tagList)) {
			if (!node.fill) Object.setPrototypeOf(node, FieldSet.prototype);
			node.fill(query, scope);
		}
		const vars = [];
		for (const elem of this.elements) {
			const name = elem.name;
			if (!name) continue;
			if (Object.prototype.hasOwnProperty.call(query, name) && !vars.includes(name)) vars.push(name);
			const val = query[name];
			const str = ((v) => {
				if (v == null) return "";
				else if (typeof v == "object") return v;
				else return v.toString();
			})(val);
			switch (elem.type) {
				case 'submit':
					break;
				case 'radio':
				case 'checkbox':
					if (Array.isArray(val) && val.length == 0 && elem.value == "") {
						elem.checked = true;
					} else {
						elem.checked = (Array.isArray(val) ? val : [str]).some((str) => {
							return str.toString() == elem.value;
						});
					}
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
		}
		return vars;
	}
	save() {
		for (const node of this.elements) {
			if (node.save) node.save();
		}
	}
	reset() {
		for (const node of this.elements) {
			if (node.reset) node.reset();
		}
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
	handleReset(e, state) {
		this.reset();
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		this.toggleMessages();
		if (this.matches('.loading')) return;
		if (e.type != "submit" && this.querySelector('[type="submit"]')) return;
		let fn = this[this.method + 'Method'];
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
		if (e.target.type != "text") return;
		this.ignoreInputChange = true;
		this.handleSubmit(e, state);
	}
	handleChange(e, state) {
		if (e.target.type == "text" && this.ignoreInputChange) return;
		this.handleSubmit(e, state);
	}
	getMethod(e, state) {
		const redirect = this.getAttribute('action');
		const loc = Page.parse(redirect);
		Object.assign(loc.query, this.read(false));
		if (loc.samePathname(state)) {
			loc.query = { ...state.query, ...loc.query };
		}
		let status = 200;
		const p = this.ignoreInputChange
			? state.replace(loc)
			: state.push(loc);
		return p.catch((err) => {
			if (err.status != null) status = err.status;
			else status = 0;
		}).then(() => {
			this.toggleMessages(status);
		});
	}
	postMethod(e, state) {
		if (e.type != "submit") return;
		const form = this;
		const $query = this.dataset;

		form.classList.add('loading');

		const data = { $query	};
		return Promise.all(Array.from(form.elements).filter((node) => {
			return Boolean(node.presubmit);
		}).map((input) => {
			return input.presubmit();
		})).then(() => {
			data.$query = state.query;
			data.$request = form.read(true);
			form.disable();
			return Pageboard.fetch(form.method, Page.format({
				pathname: form.getAttribute('action'),
				query: data.$query
			}), data.$request);
		}).catch((err) => err).then((res) => {
			if (res?.grants) state.data.$grants = res.grants;
			state.scope.$response = res;
			form.enable();

			form.classList.remove('loading');

			// messages shown inside form, no navigation
			const hasMsg = form.toggleMessages(res.status);
			const ok = res.status >= 200 && res.status < 300;
			let redirect = form.getRedirect(res.status);

			if (ok) {
				form.forget();
				form.save();
				if (!redirect && form.closest('element-template') && !hasMsg) {
					redirect = state.toString();
				}
			}

			if (!redirect) return;

			data.$response = res;
			data.$status = res.status;
			if (!redirect) {
				if (res.granted) redirect = state.toString();
				else return;
			}
			if (redirect && !ok) {
				form.backup();
			}

			const loc = Page.parse(redirect).fuse(data, state.scope);
			let vary = false;
			if (loc.samePathname(state)) {
				if (res.granted) {
					vary = true;
				} else {
					vary = "patch";
				}
				state.data.$vary = vary;
			}
			return state.push(loc, {
				vary: vary
			});
		});
	}
}
window.HTMLCustomFormElement = HTMLCustomFormElement;

/* these methods must be available even on non-upgraded elements */
HTMLFormElement.prototype.enable = function () {
	for (let i = 0; i < this.elements.length; i++) {
		const elem = this.elements[i];
		elem.disabled = false;
		if (elem.hasAttribute('disabled')) elem.removeAttribute('disabled');
	}
};
HTMLFormElement.prototype.disable = function () {
	for (let i = 0; i < this.elements.length; i++) {
		const elem = this.elements[i];
		elem.disabled = true;
	}
};

Page.ready(() => {
	const Cla = window.customElements.get('element-template');
	HTMLCustomFormElement.prototype.toggleMessages = function (status) {
		return Cla.prototype.toggleMessages.call(this, status, this);
	};
	HTMLCustomFormElement.prototype.getRedirect = function (status) {
		return Cla.prototype.getRedirect.call(this, status, this);
	};

	VirtualHTMLElement.define(`element-form`, HTMLCustomFormElement, 'form');
});


HTMLSelectElement.prototype.fill = function (values) {
	if (!Array.isArray(values)) values = [values];
	for (let i = 0; i < this.options.length; i++) {
		const opt = this.options[i];
		opt.selected = values.indexOf(opt.value) > -1;
	}
};
HTMLSelectElement.prototype.reset = function () {
	for (let i = 0; i < this.options.length; i++) this.options[i].selected = false;
};

HTMLInputElement.prototype.fill = function (val) {
	if (val == null) val = "";
	if (this.type == "radio" || this.type == "checkbox") {
		this.checked = val;
	} else if (this.type == "file") {
		if (val == '' || val == null) this.removeAttribute('value');
		else this.setAttribute('value', val);
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
	} else if (this.type == "file") {
		this.defaultValue = this.getAttribute('value') || '';
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
		// FIXME might not be needed anymore
		if (this.form?.method == "get") return '';
		else return this.getAttribute('value');
	},
	set: function (val) {
		if (val == '' || val == null) this.removeAttribute('value');
		else this.setAttribute('value', val);
	}
});

Page.setup((state) => {
	// https://daverupert.com/2017/11/happier-html5-forms/
	Page.connect({
		captureBlur: (e, state) => blurHandler(e, false),
		captureInvalid: (e, state) => blurHandler(e, true),
		captureFocus: (e, state) => {
			const el = e.target;
			if (!el.matches || !el.matches('input,textarea,select')) return;
			if (e.relatedTarget?.type == "submit") return;
			updateClass(el.closest('.field') || el, el.validity, true);
		}
	}, document);

	function updateClass(field, validity, remove) {
		for (const [key, has] of Object.entries(validity)) {
			if (key == "valid") continue;
			field.classList.toggle(key, !remove && has);
		}
		field.classList.toggle('error', !remove && !validity.valid);
	}
	function blurHandler(e, checked) {
		const el = e.target;
		if (!el.matches || !el.matches('input,textarea,select')) return;
		if (!checked) el.checkValidity();
		updateClass(el.closest('.field') || el, el.validity);
	}
});

Page.ready((state) => {
	const filters = state.scope.$filters;

	function linearizeValues(query, obj = {}, prefix) {
		if (Array.isArray(query) && query.every(val => {
			return val == null || typeof val != "object";
		})) {
			// do not linearize array-as-value
			obj[prefix] = query;
		}	else for (let key of Object.keys(query)) {
			const val = query[key];
			if (prefix) key = prefix + '.' + key;
			if (val === undefined) continue;
			if (val == null) obj[key] = val;
			else if (typeof val == "object") linearizeValues(val, obj, key);
			else obj[key] = val;
		}
		return obj;
	}
	filters.form = function (val, what, action, name) {
		const form = name
			? document.querySelector(`form[name="${name}"]`)
			: what.parent.closest('form');
		if (!form) {
			// eslint-disable-next-line no-console
			console.warn("No parent form found");
			return val;
		}
		if (action == "toggle") {
			action = val ? "enable" : "disable";
		}
		// NB: call Class methods to deal with uninstantiated custom form
		if (action == "enable") {
			HTMLCustomFormElement.prototype.enable.call(form);
		} else if (action == "disable") {
			HTMLCustomFormElement.prototype.disable.call(form);
		} else if (action == "fill") {
			if (val == null) {
				form.reset();
			} else if (typeof val == "object") {
				let values = val;
				if (val.id && val.data) {
					// old way
					values = { ...val.data };
					for (const key of Object.keys(val)) {
						if (key != "data") values['$' + key] = val[key];
					}
				} else {
					// new way
				}
				HTMLCustomFormElement.prototype.fill.call(form, linearizeValues(values), state.scope);
				HTMLCustomFormElement.prototype.save.call(form);
			}
		} else if (action == "read") {
			const obj = {};
			for (const [key, kval] of Object.entries(val)) {
				if (form.querySelector(`[name="${key}"]`)) obj[key] = kval;
			}
			return obj;
		}
		return val;
	};
});
