Page.extend('element-blogs', class HTMLElementBlogsHelper {
	setup() {
		this.observer = new MutationObserver(() => this.updateChildren());
		this.observer.observe(this, {
			childList: true
		});
	}

	close() {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
	}

	updateChildren() {
		this.children.forEach((child, index) => {
			if (!child.getAttribute('block-id')) return;
			const curIndex = parseInt(child.dataset.index);
			if (curIndex != index) {
				child.setAttribute('data-index', index);
				this.syncBlock(child);
			}
		});
	}

	syncBlock(node) {
		const editor = window.parent.Pageboard.editor;
		if (!editor || editor.closed) return;
		const block = editor.blocks.get(node.getAttribute('block-id'));
		if (!block.data) block.data = {};
		block.data.index = parseInt(node.dataset.index) || 0;
		editor.dispatch(editor.utils.refreshTr(editor.state.tr, node, block));
	}
});
