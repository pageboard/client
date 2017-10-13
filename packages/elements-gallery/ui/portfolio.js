class HTMLElementPortfolio extends HTMLElement {
	constructor() {
		super();
		this._options = {
			masonry: {
				columnWidth: 'element-portfolio-item'
			},
			itemSelector: 'element-portfolio-item',
			percentPosition: true
		};
	}

	_setup() {
		if (this._portfolio) {
			this._teardown();
		}
		this._items = this.querySelector('[block-content="items"]');
		var mode = this._items.className;
		if (!mode) mode = this._items.className = 'cells';
		if (mode == "cells") {
			this._portfolio = new Isotope(this._items, this._options);
			this.addEventListener('load', this._loadListener, true);
		}
	}

	_loadListener() {
		if (this._portfolio) this._portfolio.layout();
	}

	_teardown() {
		if (this._portfolio) {
			this._portfolio.destroy();
			delete this._portfolio;
			this.removeEventListener('load', this._loadListener, true);
		}
	}

	connectedCallback() {
		this._setup();
	}

	disconnectedCallback() {
		this._teardown();
	}

	update() {
		this._setup();
	}
}

class HTMLElementPortfolioItem extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.update();
	}
	disconnectedCallback() {
		this.update();
	}
	update() {
		var pf = this.closest('element-portfolio');
		if (pf) pf.update();
	}
}

Page.setup(function() {
	window.customElements.define('element-portfolio', HTMLElementPortfolio);
	window.customElements.define('element-portfolio-item', HTMLElementPortfolioItem);
});

