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

	if (cla.defaults) {
		var defaults = {};
		if (!cla.observedAttributes) {
			cla.observedAttributes = Object.keys(cla.defaults).map(function(x) {
				x = (is ? '' : 'data-') + x.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
				defaults[x] = cla.defaults[x];
				return x;
			});
		}
		monkeyPatchAll(cla.prototype, {
			patch(state) {
				this.options = nodeOptions(this, defaults, state, is);
				if (typeof this.reveal == "function" && this.currentSrc) {
					this.reveal(state);
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

function monkeyPatch(proto, meth, cb) {
	Object.defineProperty(proto, meth, {
		configurable: true,
		enumerable: true,
		value: (function(fn) {
			return function(...args) {
				var ret = cb.apply(this, args);
				if (fn) ret = fn.apply(this, args);
				return ret;
			};
		})(proto[meth])
	});
}

function nodeOptions(node, defaults, state, is) {
	var list = Object.keys(defaults);
	var params = stateOptions(node.id, list, state);
	var opts = {};
	list.forEach((key) => {
		var def = defaults[key];
		var isData = key.startsWith('data-');
		if (isData) key = key.substring(5);
		var val;
		if (Object.hasOwnProperty.call(params, key)) {
			val = params[key];
		} else if (isData) {
			val = node.dataset[key];
		} else if (is && node[key] !== undefined) {
			val = node[key];
		} else {
			val = node.getAttribute(key);
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
		if (val != null) opts[key] = val;
	});
	return opts;
}

function stateOptions(id, list, state) {
	var opts = {};
	Object.keys(state.query).forEach(function(key) {
		var [qid, name] = key.split('.');
		if (name == null || qid != id) return;
		if (list.includes('data-' + name)) {
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
	monkeyPatchAll(Cla.prototype, Ext.prototype);
};

function monkeyPatchAll(ClaProto, ExtProto) {
	Object.getOwnPropertyNames(ExtProto).forEach(function(meth) {
		if (meth != "constructor") {
			monkeyPatch(ClaProto, meth, ExtProto[meth]);
		}
	});
}
HTMLCustomElement.extend.cache = {};

if (!NodeList.prototype.indexOf) NodeList.prototype.indexOf = function(node) {
	return Array.prototype.indexOf.call(this, node);
};

if (!HTMLCollection.prototype.indexOf) HTMLCollection.prototype.indexOf = NodeList.prototype.indexOf;

module.exports = HTMLCustomElement;

Page.setup(function(state) {
	if (window.IntersectionObserver) {
		state.ui.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				var target = entry.target;
				if (entry.isIntersecting || entry.intersectionRatio > 0) {
					observer.unobserve(target);
					if (target.currentSrc) return;
					target.reveal(state);
				}
			});
		}, {
			threshold: 0
		});
	}
});

Page.close(function(state) {
	if (state.ui.observer) {
		state.ui.observer.disconnect();
		delete state.ui.observer;
	}
});

