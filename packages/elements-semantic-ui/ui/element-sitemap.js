class HTMLElementSitepage extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.initialUrl = this.dataset.url;
		this.update(true);
	}

	update(check) {
		var url = this.dataset.url || "";
		var initialUrl = this.initialUrl;
		var name = url.substring(1).split('/').pop();
		var parent = this.parentNode && this.parentNode.closest('element-sitepage');
		var newUrl = parent ? parent.dataset.url + '/' + name : url;
		this.initialUrl = newUrl;
		if (check && url == newUrl) {
			return;
		}
		var children = this.querySelector('[block-content="children"]').children;
		Array.prototype.forEach.call(children, function(child) {
			if (!child.matches('element-sitepage')) return; // cursor
			var childUrl = child.dataset.url;
			if (childUrl.startsWith(initialUrl + '/')) {
				childUrl = newUrl + childUrl.substring(initialUrl.length);
				child.setAttribute('data-url', childUrl);
			}
		});
	}
}

Page.setup(function() {
	window.customElements.define('element-sitepage', HTMLElementSitepage);
});
