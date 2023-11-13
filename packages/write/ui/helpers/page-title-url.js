Pageboard.schemaHelpers.pageTitle = class PageTitle {
	constructor(input, opts, props) {
		this.input = input;
		this.change = this.change.bind(this);
		this.checkHandler = this.checkHandler.bind(this);
	}

	checkHandler(e) {
		if (e.target.closest('[name="url"]')) this.check();
	}

	check(only) {
		const { url = "" } = this.block.data;
		const nameUrl = url.split("/").pop();
		if (Pageboard.utils.slug(this.input.value) == nameUrl) {
			this.tracking = true;
		} else if (!only) {
			this.tracking = false;
		}
	}

	change() {
		this.refresh();
		Pageboard.trigger(this.inputUrl, 'input');
	}

	get inputUrl() {
		return this.input.closest('form').querySelector('[name="url"]');
	}

	refresh() {
		const node = Pageboard.editor.blocks.domQuery(this.block.id, { focused: true });
		const parentUrl = node?.parentNode.closest('[block-id]')?.dataset.url ?? '';
		const { url = parentUrl + '/', prefix } = this.block.data;
		if (!this.tracking && !prefix) return;

		const val = this.input.value;
		if (!prefix) {
			const slug = Pageboard.utils.slug(val);
			const list = url.split('/');
			list[list.length - 1] = slug;
			this.inputUrl.value = list.join('/');
		} else {
			this.inputUrl.value = url.endsWith('/') ? url : (parentUrl + '/');
		}
	}

	update(block) {
		const oldPrefix = this.block.data?.prefix;
		this.block = block;
		if (oldPrefix != block.data?.prefix) {
			this.change();
		}
	}

	init(block) {
		this.block = block;
		this.input.addEventListener('input', this.change);
		this.check();
	}

	destroy() {
		this.input.removeEventListener('input', this.change);
	}
};

Pageboard.schemaHelpers.pageUrl = class PageUrl {
	constructor(input, opts, props) {
		this.field = input.closest('.field');
		this.input = input;
		this.check = this.check.bind(this);
		this.input.addEventListener('input', this.check);
		this.notPrefix = this.field.dom(`<div class="ui pointing red basic label">Only the home page can have a url ending with /</div>`);
		this.warnSame = this.field.dom(`<div class="ui pointing red basic label">Another page has the same address</div>`);
	}

	check() {
		let { value } = this.input;
		if (this.block.data?.prefix) {
			this.notPrefix.remove();
			if (!value.endsWith('/')) {
				value = this.input.value = value.split('/').slice(0, -1).join('/') + '/';
				Pageboard.trigger(this.input, 'input');
			}
		} else if (value != "/" && value.endsWith('/')) {
			this.field.appendChild(this.notPrefix);
		} else if (this.notPrefix.parentNode) {
			this.notPrefix.remove();
		}
		if (Pageboard.editor.controls.store.checkUrl(this.block.id, value)) {
			this.field.appendChild(this.warnSame);
		} else if (this.warnSame.parentNode) {
			this.warnSame.remove();
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
