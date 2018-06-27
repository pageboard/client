class HTMLElementSitepage extends HTMLCustomElement {
	connectedCallback() {
		var url = this.dataset.url;
		this.update(true);
		if (url != this.dataset.url) {
			// mutate dom to make the editor render this block again
			setTimeout(function() {
				this.setAttribute('data-url', this.dataset.url);
			}.bind(this));
		}
		var content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.observer = new MutationObserver(function(mutations) {
			this.updateChildren();
		}.bind(this));
		this.observer.observe(content, {
			childList: true
		});
	}

	disconnectedCallback() {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
	}

	updateChildren() {
		var parentUrl = this.dataset.url;
		var content = this.querySelector('[block-content="children"]');
		if (!content) return;
		Array.prototype.forEach.call(content.children, function(child) {
			if (!child.matches('element-sitepage')) return; // cursor
			var childUrl = child.dataset.url;
			var name = childUrl.split('/').pop();
			// do not trigger update, it would process twice
			child.dataset.url = parentUrl + '/' + name;
		});
	}

	update(check) {
		var url = this.dataset.url || "";
		var name = url.substring(1).split('/').pop();
		var parent = this.parentNode;
		var parentUrl;
		if (parent) {
			if (parent.matches('[block-type="sitemap"]')) {
				parentUrl = "";
			} else {
				parent = parent.closest('element-sitepage');
				if (parent) parentUrl = parent.dataset.url;
			}
		}
		var newUrl = parent ? parentUrl + '/' + name : url;
		this.dataset.url = newUrl;
		if (check && url == newUrl) {
			return;
		}
		this.updateChildren();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-sitepage', HTMLElementSitepage);
});
