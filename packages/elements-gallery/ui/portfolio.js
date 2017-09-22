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
		this._items = this.querySelector('[block-content="items"]');
		var mode = this._items.className;
		if (!mode) mode = this._items.className = 'cells';
		if (mode == "cells") {
			this.portfolio = new Isotope(this._items, this._options);
			this.addEventListener('load', this._loadListener, true);
		}
		this.portfolioMenu = Array.prototype.find.call(this.children, function(node) {
			return node.matches('.menu');
		});

		if (this.dataset.dual == "true") {
			if (!this.portfolioMenu) {
				this.portfolioMenu = this.dom`<div class="ui tiny compact icon menu">
					<a class="icon item active" data-mode="cells"><i class="grid icon"></i></a>
					<a class="icon item" data-mode="articles"><i class="list icon"></i></a>
				</div>`;
				this.insertBefore(this.portfolioMenu, this._items);
			}
			this.portfolioMenu.addEventListener('click', this._switchListener, false);
		} else {
			if (this.portfolioMenu) {
				this.portfolioMenu.remove();
				delete this.portfolioMenu;
			}
			return;
		}
	}

	_loadListener() {
		if (this.portfolio) this.portfolio.layout();
	}

	_switchListener(e) {
		var target = e.target.closest('.item');
		if (!target || target.matches('.active')) return;
		var portfolio = this.closest('element-portfolio');

		Array.from(target.parentNode.querySelectorAll('.item')).forEach(function(node) {
			node.classList.remove('active');
			portfolio.classList.remove(node.dataset.mode);
		}, this);
		target.classList.add('active');
		var mode = target.dataset.mode;
		portfolio._items.className = mode;
		if (mode == "articles") {
			portfolio._teardown();
			Array.from(portfolio.querySelectorAll('element-portfolio-image')).forEach(function(node) {
				node.update();
			});
		} else {
			portfolio.update();
		}
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
		if (this.portfolioMenu) {
			this.portfolioMenu.removeEventListener('click', this._switchListener, false);
			delete this.portfolioMenu;
		}
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

		// computeGutters is used once to get those numbers,
		// and the values for gutters are copied in portfolio.css
		// for n=4 gutter is 0.75, n=3 gutter is 1, n=2 gutter is 1.5
		var sizes = {
			square: { // computeGutters(1.5, 1.5, 1, 4)
				w: {"1":97, "2": 197},
				h: {"1":97, "2": 197}
			},
			tall: { // computeGutters(1.5, 1.5, 1.29897, 4)
				w: {"1":97, "2": 197},
				h: {"1":126.0001, "2": 255.0002}
			},
			wide: { // computeGutters(1.5, 1.5, 0.62887, 3)
				w: {"1":97, "2": 197},
				h: {"1":61.0004, "2": 125.0008}
			},
			article: {
				w: {"1":194, "2": 194},
				h: {"1":97, "2": 97}
			}
		};
		var shape = portfolio.dataset.shape;
		if (shape == "rectangle") {
			// legacy
			shape = "tall";
		}
		if (portfolio._items.classList.contains('articles')) {
			shape = "article";
		}
		var w = sizes[shape].w[item.dataset.scaleWidth || "1"];
		var h = sizes[shape].h[item.dataset.scaleHeight || "1"];

		this.img.srcset = `${url}${sep}rs=w:${w}%2Ch:${Math.round(h)}%2Cenlarge 160w,
			${url}${sep}rs=w:${2*w}%2Ch:${Math.round(2*h)}%2Cenlarge 320w,
			${url}${sep}rs=w:${3*w}%2Ch:${Math.round(3*h)}%2Cenlarge 640w,
			${url}${sep}rs=w:${4*w}%2Ch:${Math.round(4*h)}%2Cenlarge 1280w`;
	}
	connectedCallback() {
		this.update();
	}
}

Page.setup(function() {
	window.customElements.define('element-portfolio', HTMLElementPortfolio);
	window.customElements.define('element-portfolio-image', HTMLElementPortfolioImage);
});

/*
	p, q are initial x, y gutters for n=2
	f is any h/w ratio one wants to impose on the grid cell

function computeGutters(p, q, f, n) {
	var s = 100*f - 2*f*p + q;
	var t = 100 - p;
	var u = 50 - p;
	var a = s / u;
	var b = f * u / t;
	var c = s / t;
	var P = (100 * (2*c - a)) / (n * (c - a));
	var Q = (100 * (2*c*f - a*c)) / (n * (c - a));
	var w = (100 / n) - P;
	var h = f * w;
	var W = 2*w + P;
	var H = 2*h + Q;
	var obj = {
		gx: P,
		gy: Q,
		pw: w,
		pW: W,
		ph: h,
		pH: H,
		w: n*w,
		W: n*W,
		h: n*h,
		H: n*H
	};
	for (var k in obj) obj[k] = Math.round(obj[k] * 10000) / 10000;
	return obj;
}
*/
