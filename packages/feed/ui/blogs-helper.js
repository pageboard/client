Page.extend('element-blogs', class HTMLElementBlogsHelper {
	setup(state) {
		this.observer = new MutationObserver(() => this.updateChildren(state.scope));
		this.observer.observe(this, {
			childList: true
		});
	}

	close() {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
	}

	updateChildren(scope) {
		this.children.forEach((child, index) => {
			if (!child.getAttribute('block-id')) return;
			const curIndex = parseInt(child.dataset.index);
			if (curIndex != index) {
				child.setAttribute('data-index', index);
				this.syncBlock(scope, child);
			}
		});
	}

	syncBlock(scope, node) {
		const editor = scope.editor;
		if (!editor || editor.closed) return;
		const block = editor.blocks.get(node.getAttribute('block-id'));
		if (!block.data) block.data = {};
		block.data.index = parseInt(node.dataset.index) || 0;
		editor.dispatch(editor.utils.refreshTr(editor.state.tr, node, block));
	}
});
