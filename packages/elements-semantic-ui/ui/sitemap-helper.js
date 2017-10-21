class HTMLElementSitepage extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.initialUrl = this.dataset.url;
		this.update(true);
		this.observer = new MutationObserver(function(mutations) {
			this.updateChildren();
		}.bind(this));
		this.observer.observe(this.querySelector('[block-content="children"]'), {
			childList: true
		});
	}

	disconnectedCallback() {
		this.observer.disconnect();
	}

	updateChildren() {
		var parentUrl = this.dataset.url;
		var children = this.querySelector('[block-content="children"]').children;
		Array.prototype.forEach.call(children, function(child) {
			if (!child.matches('element-sitepage')) return; // cursor
			var childUrl = child.dataset.url;
			var name = childUrl.split('/').pop();
			// do not trigger update, it would process twice
			child.dataset.url = parentUrl + '/' + name;
		});
	}

	update(check) {
		var url = this.dataset.url || "";
		var initialUrl = this.initialUrl;
		var name = url.substring(1).split('/').pop();
		var parent = this.parentNode && this.parentNode.closest('element-sitepage');
		var newUrl = parent ? parent.dataset.url + '/' + name : url;
		this.initialUrl = this.dataset.url = newUrl;
		if (check && url == newUrl) {
			return;
		}
		this.updateChildren();
	}
}

Page.setup(function() {
	window.customElements.define('element-sitepage', HTMLElementSitepage);
});
