Pageboard.schemaHelpers.describe = class Describe {
	#url;

	constructor(input, opts) {
		this.field = input.closest('.field');
		this.input = input;
		this.opts = opts;
	}

	async init(block) {
		const doc = this.input.ownerDocument;
		this.field.classList.add('inline');
		this.button = doc.dom`<button class="ui compact mini blue icon button"><i class="magic icon"></i></button>`;
		this.input.before(this.button);
		this.button.addEventListener('click', this);
		this.update(block);
	}

	update(block) {
		this.#url = block.data[this.opts.property ?? 'url'];
		this.button.disabled = !this.#url;
	}

	async handleEvent(e) {
		if (!this.#url) return;
		this.input.value = (await Pageboard.uiLoad(
			this.button,
			Page.fetch('get', '/@api/ai/depict', {
				url: this.#url
			})
		)).item.data.text;
		Pageboard.trigger(this.input, 'change');
	}

	destroy() {
		this.button.removeEventListener('click', this);
		this.button.remove();
	}
};
