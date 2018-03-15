class HTMLElementTabs extends HTMLCustomElement {
	init() {
		this.click = this.click.bind(this);
	}
	connectedCallback() {
		this.addEventListener('click', this.click, false);
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.click, false);
	}
	click(e) {
		var item = e.target;
		var menu = item.closest('[block-content="items"]');
		if (!menu || menu.parentNode != this) return;
		var pos = 0, cur = item;
		while (cur = cur.previousElementSibling) pos++;
		var tabs = this.querySelector('[block-content="tabs"]');
		var tabItem = tabs.children[pos];
		if (!tabItem) {
			// do something weird
			console.warn("Missing tab in", this);
			return;
		}
		Array.prototype.forEach.call(menu.children, function(item) {
			item.classList.remove('active');
		});
		item.classList.add('active');
		Array.prototype.forEach.call(tabs.children, function(item) {
			item.classList.remove('active');
		});
		tabItem.classList.add('active');
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-tabs', HTMLElementTabs);
});
