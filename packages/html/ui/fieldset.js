class HTMLElementFieldSet extends Page.create(HTMLFieldSetElement) {
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
		this.fill(null);
		state.finish(() => this.fill(null));
	}
	handleAllChange(e, state) {
		if (this.form?.contains(e.target)) {
			this.fill(null);
		}
	}
}


Page.define(`element-fieldset`, HTMLElementFieldSet, 'fieldset');

