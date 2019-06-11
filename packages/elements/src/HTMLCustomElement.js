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
	if (window.customElements.get(name)) return cla;

	var exts = {
		connectedCallback: function() {
			if (is && !this._initialized) {
				this._initialized = true;
				if (this.init) this.init();
			}
			Page.connect(this);
		},
		disconnectedCallback: function() {
			Page.disconnect(this);
		}
	};
	if (cla.defaults) {
		if (!cla.observedAttributes) cla.observedAttributes = Object.keys(cla.defaults).map(function(x) {
			return 'data-' + x.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
		});
		exts.patch = function(state) {
			this.options = nodeOptions(this, cla.defaults, state);
		};
		exts.setup = function(state) {
			if (!this.options) this.options = nodeOptions(this, cla.defaults, state);
		};
	}

	HTMLCustomElement.intercept(cla, exts);

	window.customElements.define(name, cla, is ? {extends: is} : undefined);
	return cla;
};

function intercept(proto, meth, cb) {
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

HTMLCustomElement.intercept = function(cla, obj) {
	Object.keys(obj).forEach(function(name) {
		intercept(cla.prototype, name, obj[name]);
	});
};

module.exports = HTMLCustomElement;

