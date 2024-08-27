Pageboard.schemaHelpers.datalist = class Datalist {
	constructor(input, opts, props) {
		this.field = input.closest('.field');
		this.input = input;
		this.opts = opts;
	}

	async init(block) {
		this.input.hidden = true;
		const doc = this.input.ownerDocument;
		this.field.classList.add('inline');
		this.select = doc.dom`<select class="ui compact dropdown"></select>`;
		this.field.appendChild(this.select);
		const url = new URL(this.opts.url, document.location);
		const res = await Page.fetch('get', url.pathname, Object.fromEntries(
			url.searchParams
		));
		this.select.textContent = '';
		this.select.append(doc.dom`<option value="">--</option>
			<option value="${this.opts.value}">[items|repeat:]${this.opts.title}</option>`.fuse(res, Page.scope));

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
		if (!val) return;
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
