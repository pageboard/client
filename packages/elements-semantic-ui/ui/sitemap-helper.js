class HTMLElementSitepage extends HTMLCustomElement {
	static get defaults() {
		return {
			url: null,
			index: (x) => parseInt(x) || 0
		};
	}
	patch(state) {
		this.syncBlock();
	}
	setup(state) {
		var content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.observer = new MutationObserver((mutations) => this.updateChildren());
		this.observer.observe(content, {
			childList: true
		});
	}

	close(state) {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
	}

	updateChildren() {
		if (this.updating) return;
		var content = this.querySelector('[block-content="children"]');
		if (!content) return;
		this.updating = true;
		var parentUrl = this.dataset.url || "";
		Array.prototype.forEach.call(content.children, function(child, index) {
			if (!child.matches('element-sitepage')) return; // cursor
			var childUrl = child.dataset.url || '';
			if (childUrl.startsWith('/.')) return;
			var newUrl = parentUrl + "/" + childUrl.split('/').pop();
			if (childUrl != newUrl) {
				child.setAttribute('data-url', newUrl);
			}
			var curIndex = parseInt(child.dataset.index);
			if (curIndex != index) {
				child.setAttribute('data-index', index);
			}
		});
		this.updating = false;
	}

	syncBlock() {
		if (!this.parentNode) return;
		var editor = window.parent.Pageboard.editor;
		var block = editor.blocks.get(this.getAttribute('block-id'));
		if (!block.data) block.data = {};
		var data = this.options;
		if (Object.keys(data).some((key) => data[key] != block.data[key])) {
			Object.assign(block.data, data);
			editor.dispatch(editor.utils.refreshTr(editor.state.tr, this, block));
			this.updateChildren();
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-sitepage', HTMLElementSitepage);
	HTMLCustomElement.extend('element-sitemap', class SitemapHelper extends HTMLElementSitepage {
		patch() { /* do not call syncBlock when attributes change */ }
	});
});
