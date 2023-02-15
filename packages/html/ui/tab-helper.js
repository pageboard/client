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
		const items = this.items;
		const tabs = this.tabs;
		if (!items || !tabs) return;
		for (const node of record.addedNodes) {
			tabs.insertBefore(state.scope.$view.render({
				type: 'tab'
			}), tabs.children[items.children.indexOf(node) + 1]);
		}
		for (let i = 0; i < record.removedNodes.length; i++) {
			const pos = record.target.childNodes.indexOf(record.previousSibling) + 1 + i;
			const child = tabs.childNodes[pos];
			if (child) child.remove();
		}
	}
	handleClick(e, state) {
		const item = e.target.closest('[block-type="tab_item"]');
		if (!item) return;
		const menu = item.parentNode;
		if (!menu || menu.parentNode != this) return;
		this.options.index = this.dataset.index = menu.children.indexOf(item);
	}
});

