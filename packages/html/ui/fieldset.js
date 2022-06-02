class HTMLCustomFieldSetElement extends HTMLFieldSetElement {
	static defaults = {
		dataName: null,
		dataValue: null
	};
	constructor() {
		super();
		this.init?.();
	}

	#update() {
		if (this.isContentEditable || !this.options.name) return;
		const val = this.form?.read(true)?.[this.options.name];
		this.disabled = this.hidden = val != this.options.value;
	}

	patch(state) {
		// before/after form#fill
		this.#update();
		state.finish(() => this.#update());
	}
	setup() {
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
