Page.setup(function(state) {
	HTMLCustomElement.extend('element-tabs', class {
		setup(state) {
			if (!this.observer) this.observer = new MutationObserver((records) => {
				records.forEach((record) => this.mutate(record, state));
			});
			this.observer.observe(this.items, {childList: true});
		}
		close() {
			this.observer.disconnect();
		}
		mutate(record, state) {
			var items = this.items;
			var tabs = this.tabs;
			if (!items || !tabs) return;
			Array.from(record.addedNodes).forEach((node) => {
				tabs.insertBefore(state.scope.$view.render({
					type: 'tab'
				}), tabs.children[items.children.indexOf(node)]);
			});
			Array.from(record.removedNodes).forEach((node, i) => {
				var pos = record.target.childNodes.indexOf(record.previousSibling) + 1 + i;
				var child = tabs.childNodes[pos];
				if (child) child.remove();
			});
		}
	});
});
