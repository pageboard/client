// this works in babel 6, see postinstall-js
class HTMLCustomElement extends HTMLElement {
	constructor(...args) {
		const self = super(...args);
		if (self.init) self.init();
		return self;
	}
	init() {}
}

HTMLCustomElement.define = function(name, cla, is) {
	if (cla.init) cla.init();

	var preset = window.customElements.get(name);
	if (preset) return cla;
	
	Object.defineProperty(cla.prototype, 'attributeChangedCallback', {
		configurable: true,
		value: function(name, src, dst, ns) {
			if (src !== dst && this.patch) {
				if (!Object.hasOwnProperty.call(this.constructor, 'defaults') || this.options) {
					Page.patch(this);
				}
			}
		}
	});
	Object.defineProperty(cla.prototype, 'connectedCallback', {
		configurable: true,
		value: function() {
			if (is && this.init && !this.initCalled) {
				this.initCalled = true;
				this.init();
			}
			Page.connect(this);
		}
	});
	Object.defineProperty(cla.prototype, 'disconnectedCallback', {
		configurable: true,
		value: function() {
			Page.disconnect(this);
		}
	});
	var claDefs = cla.defaults;
	if (claDefs) {
		var defaults = {};
		if (!cla.observedAttributes) {
			cla.observedAttributes = Object.keys(claDefs).map(function(camel) {
				var attr = camel.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
				if (!is) attr = 'data-' + attr;
				var isData = attr.startsWith('data-');
				var name = camel;
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
		monkeyPatchAll(cla.prototype, {
			patch(state) {
				this.options = nodeOptions(this, defaults, state, is);
				if (typeof this.reveal == "function" && this.currentSrc) {
					this.reveal(state);
				}
			},
			paint(state) {
				if (!this.options) {
					this.options = nodeOptions(this, defaults, state, is);
				}
			},
			setup(state) {
				if (!this.options) {
					this.options = nodeOptions(this, defaults, state, is);
				}
				if (typeof this.reveal == "function" && !this.currentSrc) {
					if (state.ui.observer) state.ui.observer.observe(this);
					else this.reveal(state);
				}
			},
			close(state) {
				if (typeof this.reveal == "function" && !this.currentSrc) {
					if (state.ui.observer) state.ui.observer.unobserve(this);
				}
			}
		});
	}

	window.customElements.define(name, cla, is ? {extends: is} : undefined);
	return cla;
};

function monkeyPatch(proto, meth, cb, after) {
	Object.defineProperty(proto, meth, {
		configurable: true,
		enumerable: true,
		value: (function(fn) {
			return function(...args) {
				var ret;
				if (after && fn) ret = fn.apply(this, args);
				ret = cb.apply(this, args);
				if (!after && fn) ret = fn.apply(this, args);
				return ret;
			};
		})(proto[meth])
	});
}

function nodeOptions(node, defaults, state, is) {
	var params = stateOptions(node.id, defaults, state);
	var opts = {};
	Object.entries(defaults).forEach(([name, {attr, isData, def}]) => {
		var val;
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
			}
		}
		if (val != null) opts[name] = val;
	});
	return opts;
}

function stateOptions(id, defaults, state) {
	var opts = {};
	Object.keys(state.query).forEach(function(key) {
		var [qid, name] = key.split('.');
		if (name == null || qid != id) return;
		var {isData} = defaults[name];
		if (isData) {
			opts[name] = state.query[key];
			state.vars[key] = true;
		}
	});
	return opts;
}

HTMLCustomElement.extend = function(name, Ext, is) {
	var Cla = window.customElements.get(name);
	if (is) name += "_" + is;
	var plugins = this.extend.cache;
	var list = plugins[name];
	if (!list) list = plugins[name] = {};
	if (!Ext.name) console.warn("Please name the extension of", name, Ext);
	if (list[Ext.name]) return;
	list[Ext.name] = true;
	// extend appends Ext.prototype, not prepend
	monkeyPatchAll(Cla.prototype, Ext.prototype, true);
};

function monkeyPatchAll(ClaProto, ExtProto, after) {
	Object.getOwnPropertyNames(ExtProto).forEach(function(meth) {
		if (meth != "constructor") {
			monkeyPatch(ClaProto, meth, ExtProto[meth], after);
		}
	});
}
HTMLCustomElement.extend.cache = {};

module.exports = HTMLCustomElement;

Page.setup(function(state) {
	if (window.IntersectionObserver) {
		state.ui.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				var target = entry.target;
				var ratio = entry.intersectionRatio || 0;
				if (ratio <= 0) return;
				if (target.nodeName == "ELEMENT-EMBED" && ratio <= 0.2) return;
				observer.unobserve(target);
				if (target.currentSrc) return;
				target.reveal(state);
			});
		}, {
			threshold: [0.0001, 0.2],
			rootMargin: "30px"
		});
	}
});

Page.close(function(state) {
	if (state.ui.observer) {
		state.ui.observer.disconnect();
		delete state.ui.observer;
	}
});

