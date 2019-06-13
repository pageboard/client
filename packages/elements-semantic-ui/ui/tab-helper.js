Page.setup(function(state) {
	HTMLCustomElement.intercept(window.customElements.get('element-tabs'), {
		setup: function(state) {
			if (!this.observer) this.observer = new MutationObserver((records) => {
				records.forEach((record) => this.mutate(record, state));
			});
			this.observer.observe(this.items, {childList: true});
		},
		close: function() {
			this.observer.disconnect();
		},
		mutate: function(record, state) {
			var items = this.items;
			var tabs = this.tabs;
			if (!items || !tabs) return;
			var tabElt = state.scope.$elements.tab;
			Array.from(record.addedNodes).forEach(node => {
				tabs.insertBefore(tabElt.render(), tabs.children[this.index(node)]);
			});
			var deletions = record.removedNodes.length;
			if (deletions) {
				var pos = record.previousSibling ? this.index(record.previousSibling) + 1 : 0;
				while (deletions-- > 0) {
					var child = tabs.children[pos];
					if (child) child.remove();
				}
			}
		}
	});
});
