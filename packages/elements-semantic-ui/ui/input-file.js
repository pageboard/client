class HTMLElementInputFile extends HTMLCustomElement {
	init() {
		this.change = this.change.bind(this);
	}
	connectedCallback() {
		var input = this.querySelector('input[type="file"]');
		if (!input) return;
		var fake = this.querySelector('input[type="text"]');
		if (fake) return;
		fake = this.ownerDocument.createElement('input');
		fake.required = input.required;
		fake.type = "text";
		fake.value = input.value;
		fake.placeholder = input.placeholder;
		this.insertBefore(fake, input);
		input.addEventListener('change', this.change);
	}

	change(e) {
		var fake = this.querySelector('input[type="text"]');
		if (!fake) return;
		fake.value = e.target.value.split(/\/|\\/).pop();
	}

	disconnectedCallback() {
		var input = this.querySelector('input');
		if (!input) return;
		input.removeEventListener('change', this.change);
	}
}

Page.setup(function() {
	window.customElements.define('element-input-file', HTMLElementInputFile);
});
