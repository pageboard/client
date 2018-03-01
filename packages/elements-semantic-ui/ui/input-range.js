class HTMLElementInputRange extends HTMLCustomElement {
	connectedCallback() {
		var input = this.querySelector('input');
		if (!input) return;
		rangeSlider.create(input);
	}

	disconnectedCallback() {
		var input = this.querySelector('input');
		if (!input) return;
		if (input.rangeSlider) input.rangeSlider.destroy();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-input-range', HTMLElementInputRange);
});
