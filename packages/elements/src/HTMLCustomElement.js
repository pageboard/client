// this works in babel 6, see postinstall-js
class HTMLCustomElement extends HTMLElement {
	constructor(me) {
		me = super(me);
		me.init();
		return me;
	}
	init() {}
}
HTMLCustomElement.define = function(name, cla) {
	if (cla.init) cla.init();
	if (!window.customElements.get(name)) window.customElements.define(name, cla);
	return cla;
};

module.exports = HTMLCustomElement;

