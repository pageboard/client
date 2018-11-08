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
	if (!window.customElements.get(name)) {
		var opts;
		if (is) {
			opts = {extends: is};
			cla.prototype._connectedCallback = cla.prototype.connectedCallback;
			cla.prototype.connectedCallback = function() {
				if (!this._initialized) {
					this._initialized = true;
					if (this.init) this.init();
				}
				this._connectedCallback();
			};
		}
		window.customElements.define(name, cla, opts);
	}
	return cla;
};

module.exports = HTMLCustomElement;

