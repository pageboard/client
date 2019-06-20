// this works in babel 6, see postinstall-js
class HTMLCustomElement extends HTMLElement {
	constructor(...args) {
		const self = super(...args);
		self.init();
		return self;
	}
	init() {}
	attributeChangedCallback(name, src, dst, ns) {
		if (src !== dst && this.patch) Page.patch(this);
	}
}

HTMLCustomElement.define = function(name, cla, is) {
	if (cla.init) cla.init();

	var preset = window.customElements.get(name);
	if (preset) return cla;

	cla.prototype.connectedCallback = function() {
		if (is && !this._initialized) {
			this._initialized = true;
			if (this.init) this.init();
		}
		Page.connect(this);
	};
	cla.prototype.disconnectedCallback = function() {
		Page.disconnect(this);
	};

	if (cla.defaults) {
		if (!cla.observedAttributes) cla.observedAttributes = Object.keys(cla.defaults).map(function(x) {
			return 'data-' + x.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
		});
	}
	window.customElements.define(name, cla, is ? {extends: is} : undefined);
	if (cla.defaults) HTMLCustomElement.extend(name, class {
		patch(state) {
			this.options = nodeOptions(this, cla.defaults, state);
		}
		setup(state) {
			if (!this.options) {
				this.options = nodeOptions(this, cla.defaults, state);
			}
		}
	}, is);
	return cla;
};

function monkeyPatch(proto, meth, cb) {
	proto[meth] = (function(fn) {
		return function(...args) {
			var ret = cb.apply(this, args);
			if (fn) ret = fn.apply(this, args);
			return ret;
		};
	})(proto[meth]);
}

function nodeOptions(node, defaults, state) {
	var list = Object.keys(defaults);
	var params = stateOptions(node.id, list, state);
	var data = Object.assign({}, node.dataset, params);
	var opts = {};
	list.forEach((key) => {
		var def = defaults[key];
		var val = data[key];
		if (typeof def == "function") {
			val = def(val);
		}	else if (typeof def == "boolean") {
			if (def === true) val = val != "false";
			else val = val == "true";
		} else if (typeof def == "number") {
			val = parseFloat(val);
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
		if (list.includes(name)) {
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
	if (list[Ext.name]) return;
	list[Ext.name] = true;
	var ExtProto = Ext.prototype;
	var ClaProto = Cla.prototype;
	Object.getOwnPropertyNames(ExtProto).forEach(function(name) {
		if (name != "constructor") monkeyPatch(ClaProto, name, ExtProto[name]);
	});
};
HTMLCustomElement.extend.cache = {};

if (!NodeList.prototype.indexOf) NodeList.prototype.indexOf = function(node) {
	return Array.prototype.indexOf.call(this, node);
};

if (!HTMLCollection.prototype.indexOf) HTMLCollection.prototype.indexOf = NodeList.prototype.indexOf

module.exports = HTMLCustomElement;

