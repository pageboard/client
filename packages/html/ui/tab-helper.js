Page.extend('element-tabs', class TabsHelper {
	setup(state) {
		if (!this.observer) this.observer = new MutationObserver(records => {
			for (const record of records) this.mutate(record, state);
		});
		this.observer.observe(this.items, {
			childList: true
		});
	}
	close() {
		if (this.observer) this.observer.disconnect();
	}
	mutate(record, state) {
		const { items, tabs } = this;
		if (!items || !tabs) return;
		const { editor } = state.scope;
		if (!editor) return;
		const { utils } = editor;
		const { tr } = editor.state;
		for (const node of record.addedNodes) {
			const cur = tabs.children[items.children.indexOf(node) - 1];
			if (!cur) continue;
			const sel = utils.selectDomTr(tr, cur);
			utils.insertTr(tr, editor.render({ type: 'tab' }), sel);
		}
		for (let i = 0; i < record.removedNodes.length; i++) {
			const pos = record.target.childNodes.indexOf(record.previousSibling) + 1 + i;
			const cur = tabs.childNodes[pos];
			if (!cur) continue;
			const sel = utils.selectDomTr(tr, cur);
			utils.deleteTr(tr, sel);
		}
		editor.dispatch(tr);
	}
	handleClick(e, state) {
		const item = e.target.closest('[block-type="tab_item"]');
		if (!item) return;
		const menu = item.parentNode;
		if (!menu || menu.parentNode != this) return;
		this.options.index = this.dataset.index = menu.children.indexOf(item);
	}
});

