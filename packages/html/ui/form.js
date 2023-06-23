class HTMLElementForm extends Page.create(HTMLFormElement) {
	getMethodLater = Page.debounce((e, state) => this.getMethod(e, state), 300);

	static linearizeValues(query, obj = {}, prefix) {
		if (Array.isArray(query) && query.every(val => {
			return val == null || typeof val != "object";
		})) {
			// do not linearize array-as-value
			obj[prefix] = query;
		} else for (let key of Object.keys(query)) {
			const val = query[key];
			if (prefix) key = prefix + '.' + key;
			if (val === undefined) continue;
			if (val == null) obj[key] = val;
			else if (typeof val == "object") this.linearizeValues(val, obj, key);
			else obj[key] = val;
		}
		return obj;
	}

	static patch(state) {
		state.scope.$filters.form = (ctx, val, action, name) => {
			const form = name
				? document.querySelector(`form[name="${name}"]`)
				: ctx.dest.node.closest('form');
			if (!form) {
				// eslint-disable-next-line no-console
				console.warn("No parent form found");
				return val;
			}
			if (action == "toggle") {
				action = val ? "enable" : "disable";
			}

			state.finish(() => {
				if (action == "enable") {
					form.enable?.();
				} else if (action == "disable") {
					form.disable?.();
				} else if (action == "fill") {
					if (val == null) {
						form.reset?.();
					} else if (typeof val == "object") {
						form.fill?.(this.linearizeValues(val), state.scope);
						form.save?.();
					}
				}
			});

			return val;
		};
		state.finish(() => {
			let index = 0;
			for (const node of document.querySelectorAll('label[for]')) {
				const prev = node.previousElementSibling;
				if (prev?.nodeName != "INPUT") continue;
				const others = document.querySelectorAll(`input[id="${node.htmlFor}"]`);
				if (others.length > 1) {
					node.htmlFor += `-${index++}`;
					prev.id = node.htmlFor;
				}
			}
		});
	}

	static setup(state) {
		// https://daverupert.com/2017/11/happier-html5-forms/
		state.connect({
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
	}

	toggleMessages(status) {
		return window.HTMLElementTemplate.prototype.toggleMessages.call(this, status, this);
	}
	getRedirect(status) {
		return window.HTMLElementTemplate.prototype.getRedirect.call(this, status, this);
	}
	patch(state) {
		if (state.scope.$write) return;
		const { submit, toggle } = state.query;
		const toggles = [];
		if (typeof toggle == "string") toggles.push(...toggle.split('-'));
		else if (Array.isArray(toggle)) toggles.push(...toggle);

		const masked = this.hasAttribute('masked');

		if (this.method != "get") {
			// ?submit=<name> for auto-submit
			if (submit && submit == this.name) {
				if (masked) toggles.push(submit);
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
		if (toggles.includes(this.name)) {
			// ?toggle=<name> for toggling hidden state
			if (toggle) state.vars.toggle = true;
			this.disabled = this.hidden = !masked;
		} else {
			this.disabled = this.hidden = masked;
		}
	}
	paint(state) {
		// ?submit=<name> for auto-submit
		// WORKAROUND use Page instead of state
		const name = state.query.submit;
		if (!name || name != this.name) return;
		// make sure to not resubmit in case of self-redirection
		delete state.query.submit;
		state.finish(() => {
			if (state.status != 200) return;
			state.dispatch(this, 'submit');
		});
	}
	read(withDefaults = false) {
		const fd = new FormData(this);
		const query = {};
		fd.forEach((val, key) => {
			if (val == "") val = null;
			// build array-like values
			const old = query[key];
			if (old !== undefined) {
				if (old == null) {
					if (val == null) {
						// keep it that way
					} else {
						query[key] = [];
					}
				} else if (val != null) {
					if (!Array.isArray(old)) query[key] = [old];
					query[key].push(val);
				}
			} else {
				query[key] = val;
			}
		});

		// withDefaults: keep value if equals to its default
		// else unset value
		for (const node of this.elements) {
			const { name, type, disabled } = node;
			if (name == null || name == "" || type == "button" || disabled) {
				continue;
			}
			let val = node.value;
			if (val == "") val = null;
			let defVal = node.defaultValue;
			if (defVal == "") defVal = null;
			else if (type == "select-one" && defVal === undefined) defVal = null;

			switch (type) {
				case "file":
					query[name] = val;
					break;
				case "textarea":
					query[name] = val;
					break;
				case "radio":
					if (!withDefaults && (node.checked == node.defaultChecked || val == null)) {
						if (query[name] == val) {
							query[name] = undefined;
						}
					}
					break;
				case "checkbox":
					if (withDefaults) {
						if (query[name] === undefined) {
							query[name] = null;
						}
					} else if (!query[name]) {
						query[name] = node.required ? null : undefined;
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
		// fieldset-list are not custom inputs yet
		for (const node of this.querySelectorAll("element-fieldset-list")) {
			node.fill?.(query, scope);
		}
		const vars = [];
		for (const elem of this.elements) {
			const name = elem.name;
			if (!name) continue;
			if (name in query && !vars.includes(name)) vars.push(name);
			const val = query[name];
			if (val === undefined) {
				elem.reset?.();
			} else {
				elem.fill?.(val);
			}
		}
		for (const node of this.querySelectorAll('fieldset[is="element-fieldset"]')) {
			node.fill?.(query, scope);
		}
		return vars;
	}
	save() {
		this.classList.remove('unsaved');
		for (const node of this.querySelectorAll("element-fieldset-list")) {
			node.save();
		}
		for (const node of this.elements) {
			if (node.save) node.save();
		}
	}
	reset() {
		this.classList.remove('unsaved');
		for (const node of this.querySelectorAll("element-fieldset-list")) {
			node.reset();
		}
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
		if (state.scope.$write) return;
		this.toggleMessages();
		if (this.matches('.loading')) return;
		if (e.type != "submit" && this.querySelector('[type="submit"]')) {
			if (this.method == "post") {
				this.classList.add('unsaved');
			}
			return;
		}
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
		const nstate = this.ignoreInputChange && state.referrer
			? state.replace(loc)
			: state.push(loc);
		nstate.catch(state => {
			const status = state.error?.status ?? 0;
			this.toggleMessages(status);
		});
	}
	catch(state) {
		const status = state.error?.status ?? 0;
		this.toggleMessages(status);
	}
	async postMethod(e, state) {
		const form = this;
		if (e.type != "submit" && form.elements.find(item => item.type == "submit")) return;
		
		form.classList.add('loading');

		await Promise.all(
			Array.from(form.elements)
				.filter(node => Boolean(node.presubmit) && !node.disabled)
				.map(input => input.presubmit(state))
		);

		const request = form.read(true);
		form.disable();

		const res = await state.fetch(form.method, Page.format({
			pathname: form.getAttribute('action'),
			query: state.query
		}), request).catch(err => err);

		const scope = state.scope.copy();
		if (res?.grants) state.scope.$grants = res.grants;
		scope.$request = request;

		scope.$response = res;
		scope.$status = res.status;
		form.enable();

		form.classList.remove('loading');

		// messages shown inside form, no navigation
		const msg = form.toggleMessages(res.status);
		if (msg) msg.fuse({}, scope);
		const ok = res.status >= 200 && res.status < 300;
		let redirect = form.getRedirect(res.status);

		if (ok) {
			form.forget();
			form.save();
			if (!redirect && form.closest('element-template') && !msg) {
				redirect = state.toString();
			}
		}
		if (!redirect) {
			if (res.granted) redirect = state.toString();
			else return;
		}
		if (redirect && !ok) {
			form.backup();
		}

		const loc = Page.parse(redirect).fuse({}, scope);
		let vary = false;
		if (loc.samePathname(state)) {
			if (res.granted) {
				vary = true;
			} else {
				vary = "patch";
			}
		}
		state.push(loc, { vary });
	}
}
window.HTMLElementForm = HTMLElementForm;
Page.define(`element-form`, HTMLElementForm, 'form');

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




HTMLSelectElement.prototype.fill = function (val) {
	if (!Array.isArray(val)) val = [val];
	for (let i = 0; i < this.options.length; i++) {
		const opt = this.options[i];
		opt.selected = val.indexOf(opt.value) > -1;
	}
};
HTMLSelectElement.prototype.reset = function () {
	for (let i = 0; i < this.options.length; i++) this.options[i].selected = false;
};

HTMLButtonElement.prototype.fill = HTMLInputElement.prototype.fill = function (val) {
	if (val == null) val = "";
	if (this.type == "radio" || this.type == "checkbox") {
		if (Array.isArray(val) && val.length == 0 && this.value == "") {
			this.checked = true;
		} else {
			this.checked = (Array.isArray(val) ? val : [val]).some(str => {
				if (str == false && this.value == "") return true;
				return str.toString() == this.value;
			});
		}
	} else {
		if (Array.isArray(val)) {
			console.warn("Avoid fill(array) on scalar input", this, val);
			val = val.shift();
		}
		if (this.type == "file") {
			if (val === '') this.removeAttribute('value');
			else this.setAttribute('value', val);
		} else if (this.type == "submit") {
			if (this.value == '') this.value = val;
		} else {
			this.value = val;
		}
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

HTMLTextAreaElement.prototype.fill = function (val) {
	this.value = val == null ? '' : val;
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

