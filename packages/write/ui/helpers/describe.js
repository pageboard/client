Pageboard.schemaHelpers.describe = class Describe {
	constructor(input, opts, props) {
		console.log(opts, props);
		this.field = input.closest('.field');
		this.input = input;
		this.opts = opts;
	}

	async init(block) {
		const doc = this.input.ownerDocument;
		this.field.classList.add('inline');
		this.button = doc.dom`<button class="ui icon button"><i class="magic icon"></i></button>`;
		this.field.appendChild(this.button);
		this.button.addEventListener('click', this);
		this.update(block);
	}

	async handleEvent(e) {
		const res = await Page.fetch('get', '/@api/ai/describe', {
			// TODO
		});
	}

	update(block) {
		const list = this.input.name.split('.');
		let val = block.data;
		if (!val) return;
		for (let i = 0; i < list.length; i++) {
			val = val[list[i]];
			if (val == null) break;
		}
		this.select.value = val == null ? "" : val;
	}

	destroy() {
		this.button.removeEventListener('click', this);
		this.button.remove();
	}

};
