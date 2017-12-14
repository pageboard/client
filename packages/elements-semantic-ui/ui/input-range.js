class HTMLElementInputRange extends HTMLElement {
	constructor() {
		super();
	}
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
	window.customElements.define('element-input-range', HTMLElementInputRange);
});
