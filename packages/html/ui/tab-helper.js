Page.setup(function(state) {
	VirtualHTMLElement.extend('element-tabs', class TabsHelper {
		setup(state) {
			if (!this.observer) this.observer = new MutationObserver((records) => {
				records.forEach((record) => this.mutate(record, state));
			});
			this.observer.observe(this.items, {
				childList: true
			});
		}
		close() {
			this.observer.disconnect();
		}
		mutate(record, state) {
			const items = this.items;
			const tabs = this.tabs;
			if (!items || !tabs) return;
			Array.from(record.addedNodes).forEach((node) => {
				tabs.insertBefore(state.scope.$view.render({
					type: 'tab'
				}), tabs.children[items.children.indexOf(node) + 1]);
			});
			Array.from(record.removedNodes).forEach((node, i) => {
				const pos = record.target.childNodes.indexOf(record.previousSibling) + 1 + i;
				const child = tabs.childNodes[pos];
				if (child) child.remove();
			});
		}
		handleClick(e, state) {
			const item = e.target.closest('[block-type="tab_item"]');
			if (!item) return;
			const menu = item.parentNode;
			if (!menu || menu.parentNode != this) return;
			this.options.index = this.dataset.index = menu.children.indexOf(item);
		}
	});
});

