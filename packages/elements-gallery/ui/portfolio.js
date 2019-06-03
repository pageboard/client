class HTMLElementPortfolio extends HTMLCustomElement {
	init() {
		this.options = {
			masonry: {
				columnWidth: 'element-portfolio-item'
			},
			itemSelector: 'element-portfolio-item',
			percentPosition: true,
			transitionDuration: 0
		};
		this.refresh = Pageboard.debounce(this.refresh, 250);
		this.reload = Pageboard.debounce(this.reload, 100);
	}

	setup() {
		if (this._loading) return;
		var gallery = this.closest('element-gallery');
		if (gallery && gallery.options.mode != "portfolio") return;
		if (this._portfolio) {
			this.destroy();
		}
		this._items = this.querySelector('[block-content="items"]');
		var mode = this._items.className;
		if (!mode) mode = this._items.className = 'cells';
		if (mode == "cells") {
			this._loading = true;
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			this._portfolio = new window.Isotope(this._items, this.options);
			window.scrollTo(scrollX, scrollY);
			var notAllLoaded = Array.from(this.querySelectorAll('img')).some(function(img) {
				return !img.complete || !img.naturalWidth;
			});
			if (!notAllLoaded) this._loading = false;
		}
	}

	captureLoad(e) {
		delete this._loading;
		this.refresh();
	}

	close(state) {
		this.destroy();
	}

	destroy() {
		delete this._loading;
		if (this._portfolio) {
			this._portfolio.destroy();
			delete this._portfolio;
		}
	}

	refresh() {
		var pf = this._portfolio;
		if (!pf) return;
		pf.layout();
	}

	reload() {
		var pf = this._portfolio;
		if (!pf) return;
		pf.reloadItems();
		pf.arrange();
		pf.layout();
	}
}

class HTMLElementPortfolioItem extends HTMLCustomElement {
	setup() {
		this.reload();
	}
	close() {
		this.reload();
	}
	reload() {
		var pf = this.closest('element-portfolio');
		if (pf) pf.reload();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-portfolio', HTMLElementPortfolio);
	HTMLCustomElement.define('element-portfolio-item', HTMLElementPortfolioItem);
});

