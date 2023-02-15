class HTMLElementSitepage extends Page.Element {
	static defaults = {
		url: null,
		index: (x) => parseInt(x) || 0
	};

	patch(state) {
		if (this.isConnected) this.syncBlock();
	}
	setup(state) {
		const content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.observer = new MutationObserver(mutations => this.updateChildren());
		this.observer.observe(content, {
			childList: true
		});
	}

	close(state) {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
	}

	updateChildren() {
		if (this.updating) return;
		const content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.updating = true;
		const parentUrl = this.dataset.url || "";
		const uniques = {};
		Array.prototype.forEach.call(content.children, (child, index) => {
			if (!child.matches('element-sitepage')) return; // cursor
			const childUrl = child.dataset.url || '';
			if (childUrl.startsWith('/.')) return;
			const newUrl = parentUrl + "/" + childUrl.split('/').pop();
			if (childUrl != newUrl && !uniques[newUrl]) {
				child.setAttribute('data-url', newUrl);
			}
			uniques[newUrl] = true;
			const curIndex = parseInt(child.dataset.index);
			if (curIndex != index) {
				child.setAttribute('data-index', index);
			}
		});
		this.updating = false;
	}

	syncBlock() {
		if (!this.parentNode || this.matches('element-sitemap')) return;
		const editor = window.parent.Pageboard.editor;
		if (!editor || editor.closed) return;
		const block = editor.blocks.get(this.getAttribute('block-id'));
		if (!block.data) block.data = {};
		const data = this.options;
		if (Object.keys(data).some(key => data[key] != block.data[key])) {
			Object.assign(block.data, data);
			editor.dispatch(editor.utils.refreshTr(editor.state.tr, this, block));
			this.updateChildren();
		} else this.updateChildren();

	}
}


Page.define('element-sitepage', HTMLElementSitepage);
Page.extend('element-sitemap', HTMLElementSitepage);

