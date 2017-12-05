class HTMLElementSelectOption extends HTMLElement {
	constructor() {
		super();
	}
	update() {
		var el = this.closest('element-select');
		if (el) {
			el._update();
			el._reset();
		}
	}
}

Page.setup(function() {
	window.customElements.define('element-select-option', HTMLElementSelectOption);
});
