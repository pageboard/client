// this works in babel 6, see postinstall-js
class HTMLCustomElement extends HTMLElement {
	constructor(...args) {
		const self = super(...args);
		self.init();
		return self;
	}
	init() {}
}
HTMLCustomElement.define = function(name, cla, is) {
	if (cla.init) cla.init();
	if (window.customElements.get(name)) return cla;
	var opts;
	if (is) {
		opts = {extends: is};
		HTMLCustomElement.intercept(cla, {
			connectedCallback: function() {
				if (!this._initialized) {
					this._initialized = true;
					if (this.init) this.init();
				}
			}
		});
	}
	HTMLCustomElement.intercept(cla, {
		connectedCallback: function() {
			Page.connect(this);
		},
		disconnectedCallback: function() {
			Page.disconnect(this);
		}
	});


	window.customElements.define(name, cla, opts);
	return cla;
};

function intercept(proto, meth, cb) {
	proto[meth] = (function(fn) {
		return function(...args) {
			var ret = cb.apply(this, ...args);
			if (fn) ret = fn.apply(this, ...args);
			return ret;
		};
	})(proto[meth]);
}

HTMLCustomElement.intercept = function(cla, obj) {
	Object.keys(obj).forEach(function(name) {
		intercept(cla.prototype, name, obj[name]);
	});
};

module.exports = HTMLCustomElement;

