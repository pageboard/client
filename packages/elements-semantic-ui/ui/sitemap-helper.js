class HTMLElementSitepage extends HTMLCustomElement {
	static get observedAttributes() {
		return ['data-url'];
	}
	init() {
		this.update = Pageboard.debounce(this.update, 100);
	}
	setup(state) {
		var content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.observer = new MutationObserver(function(mutations) {
			this.updateChildren();
		}.bind(this));
		this.observer.observe(content, {
			childList: true
		});
	}

	attributeChangedCallback(name, oldValue, newValue, namespace) {
		if (oldValue == null || oldValue === newValue) return;
		this.update();
	}

	close(state) {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
	}

	updateChildren() {
		if (this.updating) return;
		var parentUrl = this.dataset.url;
		var content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.updating = true;
		Array.prototype.forEach.call(content.children, function(child, index) {
			if (!child.matches('element-sitepage')) return; // cursor
			var childUrl = child.dataset.url;
			var name = childUrl.split('/').pop();
			// do not trigger update, it would process twice
			var newUrl = parentUrl + '/' + name;
			if (childUrl != newUrl) {
				child.setAttribute('data-url', newUrl);
			}
			var curIndex = child.dataset.index;
			if (curIndex != index) child.setAttribute('data-index', index);
		});
		this.updating = false;
	}

	update() {
		if (!this.parentNode) return;
		var url = this.dataset.url;
		var name = url.substring(1).split('/').pop();
		var parent = this.parentNode.closest('[block-type="sitemap"],[block-type="sitepage"]');
		if (!parent) return;
		var parentUrl;
		if (parent.matches('[block-type="sitemap"]')) {
			parentUrl = "";
		} else if (parent) {
			parentUrl = parent.dataset.url;
		}

		var newUrl = parentUrl ? parentUrl + '/' + name : url;
		if (url != newUrl) this.setAttribute('data-url', newUrl);
		this.updateChildren();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-sitepage', HTMLElementSitepage);
});
