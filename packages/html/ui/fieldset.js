class HTMLElementFieldSet extends Page.create(HTMLFieldSetElement) {
	static defaults = {
		dataName: null,
		dataOp: null,
		dataValue: null
	};

	#compare(to) {
		const { value } = this.options;
		if (this.options.op == "neq") return value != to;
		else return value == to;
	}

	fill(query) {
		if (this.isContentEditable || !this.options?.name || !this.form) return;
		const { name } = this.options;
		if (!query) {
			query = {};
			for (const node of this.form.querySelectorAll(
				`[name="${name}"]`
			)) {
				if (node.type == "checkbox") {
					throw new Error("Unsupported checkbox in fiedset condition: " + this.options.name);
				}
				if (node.type == "radio") {
					if (node.checked) query[name] = node.value;
				} else {
					query[name] = node.value;
				}
			}
		}
		const val = query[name];
		const disabled = this.disabled = this.hidden = !this.#compare(val);
		for (const node of this.querySelectorAll('[name]')) {
			node.disabled = disabled;
		}
	}

	patch(state) {
		// initialize
		this.fill();
	}
	handleAllChange(e, state) {
		if (this.form?.contains(e.target)) {
			this.fill();
		}
	}
}


Page.define(`element-fieldset`, HTMLElementFieldSet, 'fieldset');

