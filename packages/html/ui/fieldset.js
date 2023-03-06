class HTMLElementFieldSet extends Page.create(HTMLFieldSetElement) {
	static defaults = {
		dataName: null,
		dataValue: null
	};

	fill(query, scope) {
		if (scope.$write || !this.options?.name || !this.form) return;
		if (!query) query = this.form.read(true);
		const val = query[this.options.name];
		const disabled = this.disabled = this.hidden = val != this.options.value;
		for (const node of this.querySelectorAll('[name]')) {
			node.disabled = disabled;
		}
	}

	patch(state) {
		// before/after form#fill
		this.fill(null, state.scope);
		state.finish(() => this.fill(null, state.scope));
	}
	setup() {
		this.form?.addEventListener('change', this);
	}
	close() {
		this.form?.removeEventListener('change', this);
	}
	handleEvent(e, state) {
		if (e.type == "change") {
			this.fill(null, state.scope);
		}
	}
}


Page.define(`element-fieldset`, HTMLElementFieldSet, 'fieldset');

