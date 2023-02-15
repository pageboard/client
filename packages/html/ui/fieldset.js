class HTMLCustomFieldSetElement extends Page.create(HTMLFieldSetElement) {
	static defaults = {
		dataName: null,
		dataValue: null
	};

	fill(query) {
		if (this.isContentEditable || !this.options?.name || !this.form) return;
		if (!query) query = this.form.read(true);
		const val = query[this.options.name];
		const disabled = this.disabled = this.hidden = val != this.options.value;
		for (const node of this.querySelectorAll('[name]')) {
			node.disabled = disabled;
		}
	}

	patch(state) {
		// before/after form#fill
		this.fill();
		state.finish(() => this.fill());
	}
	setup() {
		this.form?.addEventListener('change', this);
	}
	close() {
		this.form?.removeEventListener('change', this);
	}
	handleEvent(e) {
		if (e.type == "change") {
			this.fill();
		}
	}
}


Page.define(`element-fieldset`, HTMLCustomFieldSetElement, 'fieldset');

