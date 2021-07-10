Pageboard.schemaHelpers.binding = class Binding {
	constructor(input, opts, props) {
		this.field = input.closest('.field');
		this.input = input;
	}

	init(block) {
		this.input.hidden = true;
		const doc = this.input.ownerDocument;
		function getSelectOption(name) {
			return `<option value="${name}">${Pageboard.bindings[name].title}</option>`;
		}
		this.select = doc.dom(`<select class="ui compact dropdown">
		<option value="">--</option>
		${Object.keys(Pageboard.bindings).map(getSelectOption).join('\n')}
	</select>`);
		this.field.appendChild(this.select);
		this.select.addEventListener('change', this.toInput.bind(this));
		this.update(block);
	}

	toInput() {
		this.input.value = this.select.value;
		// not sure it's useful to trigger something here
		Pageboard.trigger(this.input, 'change');
	}

	update(block) {
		const list = this.input.name.split('.');
		let val = block.data;
		for (let i = 0; i < list.length; i++) {
			val = val[list[i]];
			if (val == null) break;
		}
		this.select.value = val == null ? "" : val;
	}

	destroy() {
		this.select.remove();
		this.input.hidden = false;
	}

};
