Pageboard.schemaHelpers.units = class Units {
	constructor(input) {
		this.field = input.closest('.field');
		this.input = input;
	}

	async init(block) {
		this.field.hidden = true;
		const prev = this.field.previousElementSibling;
		this.copy = prev.appendChild(this.input);
	}

	destroy() {
		this.field.hidden = false;
		this.field.appendChild(this.copy);
	}

};
