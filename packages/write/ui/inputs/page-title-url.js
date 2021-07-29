
Pageboard.schemaHelpers.pageTitle = class PageTitle {
	constructor(input, opts, props) {
		this.input = input;
		this.form = input.closest('form');
		this.change = this.change.bind(this);
		this.checkHandler = this.checkHandler.bind(this);
	}

	checkHandler(e) {
		if (e.target.closest('[name="url"]')) this.check();
	}

	check(only) {
		const url = this.block.data.url || "";
		const nameUrl = url.split("/").pop();
		if (Pageboard.slug(this.input.value) == nameUrl) {
			this.tracking = true;
		} else if (!only) {
			this.tracking = false;
		}
	}

	change() {
		if (!this.tracking) return;
		const node = Pageboard.editor.blocks.domQuery(this.block.id, { focused: true });
		const parentNode = node && node.parentNode.closest('[block-id]');
		const parentUrl = parentNode && parentNode.dataset.url || '';
		const url = this.block.data.url || (parentUrl + '/');
		const val = this.input.value;
		const slug = Pageboard.slug(val);
		const list = url.split('/');
		list[list.length - 1] = slug;
		const inputUrl = this.form.querySelector('[name="url"]');
		inputUrl.value = list.join('/');
		Pageboard.trigger(inputUrl, 'input');
	}

	init(block) {
		this.block = block;
		this.input.addEventListener('input', this.change);
		// this.form.addEventListener('input', this.checkHandler);
		this.check();
	}

	destroy() {
		this.input.removeEventListener('input', this.change);
		// 	this.form.removeEventListener('input', this.checkHandler);
	}
};

Pageboard.schemaHelpers.pageUrl = class PageUrl {
	constructor(input, opts, props) {
		this.field = input.closest('.field');
		this.input = input;
		this.check = this.check.bind(this);
		this.input.addEventListener('input', this.check);
		this.sameDom = this.field.dom(`<div class="ui pointing red basic label">Another page has the same address</div>`);
	}

	check() {
		if (Pageboard.editor.controls.store.checkUrl(this.block.id, this.input.value)) {
			this.field.appendChild(this.sameDom);
		} else {
			if (this.sameDom.parentNode) this.sameDom.remove();
		}
	}

	init(block) {
		this.block = block;
		this.check();
	}
	update(block) {
		this.init(block);
	}
	destroy() {
		this.input.removeEventListener('input', this.check);
	}
};
