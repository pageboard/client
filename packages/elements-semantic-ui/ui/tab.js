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
		Array.prototype.forEach.call(this.items.children, function(item, i) {
			item.classList.toggle('active', i == pos);
		});
		Array.prototype.forEach.call(this.tabs.children, function(item, i) {
			item.classList.toggle('active', i == pos);
		});
	}
	handleClick(e, state) {
		var item = e.target.closest('[block-type="tab_item"]');
		var menu = item.closest('[block-content="items"]');
		if (!menu || menu.parentNode != this) return;
		this.dataset.index = item.getIndex();
		this.patch(state);
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-tabs', HTMLElementTabs);
});
