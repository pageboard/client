class HTMLElementTabs extends HTMLCustomElement {
	static get defaults() {
		return {
			index: (x) => parseInt(x) || 0
		}
	}
	get items() {
		return this.querySelector('[block-content="items"]');
	}
	get tabs() {
		return this.querySelector('[block-content="tabs"]');
	}
	patch(state) {
		var pos = this.options.index;
		var id = this.id;
		Array.prototype.forEach.call(this.items.children, function(item, i) {
			item.setAttribute('href', Page.format({
				pathname: state.pathname,
				query: Object.assign({}, state.query, {
					[`${id}.index`]: i
				})
			}));
			item.classList.toggle('active', i == pos);
		});
		Array.prototype.forEach.call(this.tabs.children, function(item, i) {
			item.classList.toggle('active', i == pos);
		});
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-tabs', HTMLElementTabs);
});
