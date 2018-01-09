class HTMLElementSelectOption extends HTMLCustomElement {
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
