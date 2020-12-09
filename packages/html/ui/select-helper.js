class HTMLElementSelectOption extends VirtualHTMLElement {
	update() {
		var el = this.closest('element-select');
		if (el) {
			el._update();
			el._reset();
		}
	}
}

Page.setup(function() {
	// VirtualHTMLElement.define('element-select-option', HTMLElementSelectOption);
});
