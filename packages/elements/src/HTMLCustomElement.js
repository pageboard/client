// this works in babel 6, see postinstall-js
class HTMLCustomElement extends HTMLElement {
	constructor(...args) {
		const self = super(...args);
		self.init();
		return self;
	}
	init() {}
	connectedCallback() {
		Page.connect(this);
	}
	disconnectedCallback() {
		Page.disconnect(this);
	}
}
HTMLCustomElement.define = function(name, cla, is) {
	if (cla.init) cla.init();
	if (!window.customElements.get(name)) {
		var opts;
		if (is) {
			opts = {extends: is};
			var proto = cla.prototype;
			proto._connectedCallback = proto.connectedCallback;
			proto.connectedCallback = function() {
				if (!this._initialized) {
					this._initialized = true;
					if (this.init) this.init();
				}
				if (this._connectedCallback) this._connectedCallback();
			};
		}
		window.customElements.define(name, cla, opts);
	}
	return cla;
};

module.exports = HTMLCustomElement;

