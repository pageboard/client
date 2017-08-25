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
		this.configure();
		this.portfolio = new Isotope(this, this._options);
		this._imagesLoaded = new imagesLoaded(this);
		this._imagesLoaded.on('progress', function() {
			if (this.portfolio) this.portfolio.layout();
		}.bind(this));
	}

	_teardown() {
		if (this.portfolio) {
			this.portfolio.destroy();
			delete this.portfolio;
			this._imagesLoaded.off('progress');
			delete this._imagesLoaded;
		}
	}

	connectedCallback() {
		this._setup();
	}

	disconnectedCallback() {
		this._teardown();
	}

	configure() {

	}

	update() {
		this._setup();
	}
}

Page.setup(function() {
	window.customElements.define('element-portfolio', HTMLElementPortfolio);
});

