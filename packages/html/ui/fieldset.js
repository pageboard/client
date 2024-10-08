class HTMLCustomFieldSetElement extends HTMLFieldSetElement {
	constructor() {
		super();
		this.init?.();
	}

	#update() {
		if (this.isContentEditable || !this.dataset.name) return;
		const name = this.dataset.name.split(".").slice(1).join('.');
		const vals = this.form ? window.HTMLCustomFormElement.prototype.read.call(this.form, true) : {};
		const val = vals[name];
		this.disabled = this.hidden = val != this.dataset.value;
	}
	patch() {
		this.#update();
	}
	setup() {
		this.#update();
		this.form?.addEventListener('change', this);
	}
	close() {
		this.form?.removeEventListener('change', this);
	}
	handleEvent(e) {
		if (e.type == "change") {
			this.#update();
		}
	}
}

Page.ready(() => {
	VirtualHTMLElement.define(`element-fieldset`, HTMLCustomFieldSetElement, 'fieldset');
});
