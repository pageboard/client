class HTMLElementSitepage extends HTMLElement {
	constructor() {
		super();
		this.initialUrl = this.dataset.url;
	}

	connectedCallback() {
		this.update(true);
	}

	update(check) {
		var node = this;
		var url = node.dataset.url || "";
		var initialUrl = node.initialUrl;
		var name = url.substring(1).split('/').pop();
		var parent = node.parentNode && node.parentNode.closest('element-sitepage');
		var parentUrl = parent ? parent.dataset.url : '';
		var newUrl = parentUrl + '/' + name;
		node.initialUrl = newUrl;
		if (check && url == newUrl) return;
		var children = node.querySelector('[block-content="children"]').children;
		Array.prototype.forEach.call(children, function(child) {
			if (!child.matches('element-sitepage')) return; // cursor
			var childUrl = child.dataset.url;
			if (childUrl.startsWith(initialUrl)) {
				childUrl = newUrl + childUrl.substring(initialUrl.length);
				child.setAttribute('data-url', childUrl);
			}
		});
		node.setAttribute('data-url', newUrl);
	}
}

Page.setup(function() {
	window.customElements.define('element-sitepage', HTMLElementSitepage);
});
