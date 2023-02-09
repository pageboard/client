// this works in babel 6, see postinstall-js
const extendCache = {};

export function create(Superclass) {
	return class extends Superclass {
		constructor() {
			super();
			if (this.constructor.is) {
				this.setAttribute('is', this.constructor.nodeName);
			}
			this.init?.();
		}
		async attributeChangedCallback(name, src, dst, ns) {
			if (src !== dst && this.patch) {
				if (!Object.hasOwnProperty.call(this.constructor, 'defaults') || this.options) {
					await Page.patch(state => this.#options(state));
					await Page.patch(this);
					await Page.paint(state => this.#paint(state));
					await Page.paint(this);
				}
			}
		}
		connectedCallback() {
			if (this.build) Page.build(state => this.#options(state));
			if (this.patch) Page.patch(state => this.#options(state));
			if (this.reveal) {
				Page.paint(state => this.#paint(state));
				Page.setup(state => this.#setup(state));
				Page.close(state => this.#close(state));
			}
			Page.connect(this);
		}
		disconnectedCallback() {
			Page.disconnect(this);
			if (this.reveal) {
				this.#close(Page);
			}
		}
		#options(state) {
			this.options = nodeOptions(state, this);
		}
		#paint(state) {
			if (!this.options) {
				this.options = nodeOptions(state, this);
			}
			if (typeof this.reveal == "function" && !this.currentSrc) {
				state.finish(() => {
					// don't wait for it
					this.reveal(state);
				});
			}
		}
		#setup(state) {
			if (!this.options) this.options = nodeOptions(state, this);
			if (typeof this.reveal == "function" && !this.currentSrc) {
				if (state.scope.observer) {
					state.scope.observer.observe(this);
				} else state.finish(() => {
					// don't wait for it
					this.reveal(state);
				});
			}
		}
		#close(state) {
			if (typeof this.reveal == "function" && !this.currentSrc) {
				state.scope.observer?.unobserve(this);
			}
		}
	};
}

export const Element = create(HTMLElement);

export function define(name, cla, is) {
	const preset = window.customElements.get(name);
	if (preset) return preset;

	if (cla.init) cla.init();

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
	if (is) name += "_" + is;
	let list = extendCache[name];
	if (!list) list = extendCache[name] = {};
	if (!Ext.name) {
		// eslint-disable-next-line no-console
		console.warn("Please name the extension of", name, Ext);
	}
	if (list[Ext.name]) return;
	list[Ext.name] = true;
	// extend appends Ext.prototype, not prepend
	monkeyPatchAll(Cla.prototype, Ext.prototype, true);
}

export function inherits(Child, { prototype: pp }) {
	const cp = Child.prototype;
	const props = Object.getOwnPropertyDescriptors(pp);
	for (const [name, desc] of Object.entries(props)) {
		if (!Object.prototype.hasOwnProperty.call(cp, name)) {
			Object.defineProperty(cp, name, desc);
		}
	}
	return Child;
}

function monkeyPatch(proto, meth, cb, after) {
	Object.defineProperty(proto, meth, {
		configurable: true,
		enumerable: true,
		writable: true,
		value: (function(fn) {
			return function(...args) {
				let isP = false;
				let ret;
				if (after && fn) {
					ret = fn.apply(this, args);
					isP = Promise.resolve(ret) == ret;
				}
				if (isP) {
					ret = ret.then(() => {
						return cb.apply(this, args);
					});
				} else {
					ret = cb.apply(this, args);
					isP = Promise.resolve(ret) == ret;
				}
				if (!after && fn) {
					if (isP) {
						ret = ret.then(() => {
							return fn.apply(this, args);
						});
					} else {
						ret = fn.apply(this, args);
					}
				}
				return ret;
			};
		})(proto[meth])
	});
}

function nodeOptions(state, node) {
	const defaults = node.constructor.internalDefaults;
	if (!defaults) return;
	const is = node.constructor.is;
	const params = stateOptions(node.id, defaults, state);
	const opts = {};
	for (const [name, {attr, isData, def}] of Object.entries(defaults)) {
		let val;
		if (Object.hasOwnProperty.call(params, name)) {
			val = params[name];
		} else if (isData) {
			val = node.dataset[name];
		} else if (is && node[name] !== undefined) {
			val = node[name];
		} else {
			val = node.getAttribute(attr);
		}
		if (typeof def == "function") {
			val = def(val);
		}	else if (typeof def == "boolean") {
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

function stateOptions(id, defaults, state) {
	const opts = {};
	for (const key of Object.keys(state.query)) {
		const [qid, name] = key.split('.');
		if (name == null || qid != id) continue;
		const { isData } = defaults[name];
		if (isData) {
			opts[name] = state.query[key];
			state.vars[key] = true;
		}
	}
	return opts;
}

function monkeyPatchAll(ClaProto, ExtProto, after) {
	for (const meth of Object.getOwnPropertyNames(ExtProto)) {
		if (meth != "constructor") {
			monkeyPatch(ClaProto, meth, ExtProto[meth], after);
		}
	}
}
