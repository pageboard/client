// there is a 1px rounding problem with percentWidth
// see https://github.com/metafizzy/isotope/issues/916
// to be fixed in next release
class HTMLElementPortfolio extends HTMLElement {
	constructor() {
		super();
		this._options = {
			masonry: {
				columnWidth: '.item'
			},
			itemSelector: '.item',
			percentPosition: true
		};
	}

	_setup() {
		if (this.portfolio) {
			this._teardown();
		}
		this.portfolio = new Isotope(this, this._options);
		this.addEventListener('load', this._loadListener, true);
	}

	_loadListener() {
		if (this.portfolio) this.portfolio.layout();
	}

	_teardown() {
		if (this.portfolio) {
			this.portfolio.destroy();
			delete this.portfolio;
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
		Array.from(this.querySelectorAll('element-portfolio-image')).forEach(function(node) {
			node.update();
		});
	}
}

class HTMLElementPortfolioImage extends HTMLElement {
	constructor() {
		super();
		this.img = this.ownerDocument.createElement('img');
		this.appendChild(this.img);
	}
	update() {
		var url = this.getAttribute('src');
		if (!url) {
			this.img.removeAttribute('src');
			return;
		}
		var portfolio = this.closest('element-portfolio');
		if (!portfolio) return;
		var item = this.closest('[block-type="portfolio_item"]');
		if (!item) return;
		var sep = '?';
		if (url.startsWith('/') == false) {
			url = ".api/image?url=" + encodeURIComponent(url);
			sep = '&';
		}

		// see portfolio.css for how to compute those numbers
		var sizes = {"1": 97, "2": 197};
		var shape = portfolio.dataset.shape;
		var w = sizes[item.dataset.scaleWidth || "1"];
		var h = sizes[item.dataset.scaleHeight || "1"] * (shape == "rectangle" ? 1.6 : 1.0);

		this.img.srcset = `${url}${sep}rs=w:${w}%2Ch:${h}%2Cenlarge 160w,
			${url}${sep}rs=w:${2*w}%2Ch:${2*h}%2Cenlarge 320w,
			${url}${sep}rs=w:${4*w}%2Ch:${4*h}%2Cenlarge 640w,
			${url}${sep}rs=w:${8*w}%2Ch:${8*h}%2Cenlarge 1280w`;
	}
	connectedCallback() {
		this.update();
	}
}

Page.setup(function() {
	window.customElements.define('element-portfolio', HTMLElementPortfolio);
	window.customElements.define('element-portfolio-image', HTMLElementPortfolioImage);
});

