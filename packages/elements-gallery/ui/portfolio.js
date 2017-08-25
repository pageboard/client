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

	}

	update() {
		this._setup();
	}
}

Page.setup(function() {
	window.customElements.define('element-portfolio', HTMLElementPortfolio);
});

