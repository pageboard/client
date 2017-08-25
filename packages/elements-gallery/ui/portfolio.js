class HTMLElementPortfolio extends HTMLElement {
	constructor() {
		super();
		this._options = {
			masonry: {
				columnWidth: '.item',
				gutter: '.item'
			},
			itemSelector: '.item',
			percentPosition: true
		};
	}

	_setup() {
		if (this.portfolio) {
			this._teardown();
		}
		this.configure();
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

	configure() {
		var prev = this._options.masonry.gutter;
		if (this.matches('.gutter')) {
			var mb = window.getComputedStyle(this.querySelector('.item')).marginBottom;
			this._options.masonry.gutter = parseInt(mb);
		} else {
			delete this._options.masonry.gutter;
		}
		return prev != this._options.masonry.gutter;
	}

	update() {
		this._setup();
	}
}

Page.setup(function() {
	window.customElements.define('element-portfolio', HTMLElementPortfolio);
});

