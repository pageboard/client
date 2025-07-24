let extendCache;

export function create(Superclass) {
	return class extends Superclass {
		#creating = true;
		constructor() {
			super();
			if (this.constructor.is) {
				this.setAttribute('is', this.constructor.nodeName);
			}
		}
		async attributeChangedCallback(name, src, dst, ns) {
			if (src == dst || this.#creating) return;
			if (this.patch) await Page.patch(state => {
				return this.patch(state);
			});
			if (this.reveal) await Promise.resolve().then(() => this.reveal?.(Page));
			if (this.paint) await Page.paint(state => {
				return this.paint(state);
			});
		}

		get options() {
			const state = Page;
			return nodeOptions(state, this);
		}
		connectedCallback() {
			this.prepare?.(Page.scope.$write);
			Page.paint(state => this.#paint(state));
			Page.close(state => this.#close(state));
			Page.connect(this);
		}
		disconnectedCallback() {
			Page.disconnect(this);
			this.#close(Page);
		}
		#paint(state) {
			this.#creating = false;
			if (this.reveal && !this.currentSrc) {
				if (state.scope.observer) {
					state.scope.observer.observe(this);
				} else state.finish(() => {
					return state.reveal(this);
				});
			}
		}
		#close(state) {
			if (this.reveal && !this.currentSrc) {
				state.scope.observer?.unobserve(this);
			}
		}
	};
}

export function define(name, cla, is) {
	const defined = window.customElements.get(name);
	if (defined) return defined;

	Page.connect(cla); // calls static methods

	const claDefs = cla.defaults;
	if (claDefs) {
		const defaults = {};
		if (!cla.observedAttributes) {
			cla.observedAttributes = Object.keys(claDefs).map(camel => {
				let attr = camel.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
				if (!is) attr = 'data-' + attr;
				const isData = attr.startsWith('data-');
				let name = camel;
				if (isData && camel.startsWith('data')) {
					name = name[4].toLowerCase() + name.substring(5);
				}
				defaults[name] = {
					attr: attr,
					isData: isData,
					def: claDefs[camel]
				};
				return attr;
			});
		}
		cla.internalDefaults = defaults;
	}
	if (is) cla.is = is;
	cla.nodeName = name;

	window.customElements.define(name, cla, is ? { extends: is } : undefined);
	return cla;
}

export function extend(name, Ext, is) {
	const Cla = window.customElements.get(name);
	if (!Cla) {
		console.debug("Cannot extend missing", name);
		return;
	}
	if (is) name += "_" + is;
	extendCache ??= new Set();
	if (extendCache.has(name)) return;
	extendCache.add(name);
	inherits(Cla, Ext);
}

function inherits(Child, Parent) {
	const pp = Parent.prototype;
	const cp = Child.prototype;
	const props = Object.getOwnPropertyDescriptors(pp);
	for (const [name, desc] of Object.entries(props)) {
		if (name == "constructor") continue;
		if (!Object.hasOwn(cp, name)) {
			Object.defineProperty(cp, name, desc);
		} else {
			const childDesc = Object.getOwnPropertyDescriptor(cp, name);
			Object.defineProperty(cp, name, {
				...desc,
				async value(...args) {
					await childDesc.value.apply(this, args);
					return desc.value.apply(this, args);
				}
			});
		}
	}
	return Child;
}

function nodeOptions(state, node) {
	const defaults = node.constructor.internalDefaults;
	if (!defaults) return;
	const is = node.constructor.is;
	const opts = {};
	for (const [name, { attr, isData, def }] of Object.entries(defaults)) {
		let val;
		const stateKey = node.id && isData ? `${node.id}.${name}` : null;
		if (stateKey && Object.hasOwnProperty.call(state.query, stateKey)) {
			val = state.query[stateKey];
			state.vars[stateKey] = true;
		} else if (isData) {
			val = node.dataset[name];
		} else if (is && node[name] !== undefined) {
			val = node[name];
		} else {
			val = node.getAttribute(attr);
		}
		if (typeof def == "function") {
			val = def(val);
		} else if (typeof def == "boolean") {
			if (typeof val != "boolean") {
				if (def === true) val = val != "false";
				else val = val == "true";
			}
		} else if (typeof def == "number") {
			if (typeof val != "number") {
				val = parseFloat(val);
				if (Number.isNaN(val)) val = def;
			}
		} else if (Array.isArray(def)) {
			if (!def.includes(val)) val = null;
		} else if (val == null && def != null) {
			val = def;
		}
		if (val != null) opts[name] = val;
	}
	return opts;
}

