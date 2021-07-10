class HTMLElementTabs extends VirtualHTMLElement {
	static defaults = {
		index: (x) => parseInt(x) || 0
	};

	get items() {
		return this.querySelector('[block-content="items"]');
	}
	get tabs() {
		return this.querySelector('[block-content="tabs"]');
	}
	patch(state) {
		const pos = this.options.index;
		const id = this.id;
		Array.prototype.forEach.call(this.items.children, function(item, i) {
			const query = Object.assign({}, state.query);
			const key = `${id}.index`;
			if (i == 0) delete query[key];
			else query[key] = i;
			item.setAttribute('href', Page.format({
				pathname: state.pathname,
				query: query
			}));
			item.classList.toggle('active', i == pos);
		});
		Array.prototype.forEach.call(this.tabs.children, function(item, i) {
			item.classList.toggle('active', i == pos);
		});
	}
}

Page.ready(function() {
	VirtualHTMLElement.define('element-tabs', HTMLElementTabs);
});
