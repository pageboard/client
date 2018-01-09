class HTMLElementCarousel extends HTMLCustomElement {
	init() {
		this._options = {
			noDomMod: true,
			wrapAround: false,
			lazyLoad: true,
			cellSelector: 'element-carousel-cell',
			adaptativeHeight: true,
			initialIndex: 0,
			imagesLoaded: true,
			cellAlign: 'left',
			contain: true
		};
		this._saveIndex = this._saveIndex.bind(this);
	}

	_setup(opts) {
		if (this.carousel) {
			this._teardown();
		} else {
			// because the element might have been setup on server
			Array.from(this.querySelectorAll(
				'.flickity-prev-next-button,.flickity-page-dots'
			)).forEach(function(node) {
				node.remove();
			});
		}
		this.configure();
		Array.prototype.forEach.call(
			this.querySelectorAll('element-carousel-cell'),
			function(cell) {
				cell.dataset.width = this._options.width;
				cell.dataset.height = this._options.height;
				if (cell.update) cell.update();
			},
			this
		);
		opts = Object.assign({}, this._options, opts);
		if (opts.fullview) {
			this.ownerDocument.body.classList.add('fullview');
		}
		this.carousel = new Flickity(this, opts);
		this.carousel.on('select', this._saveIndex);

		if (this.dataset.fullviewButton == "true") {
			if (!this._fullviewButton) {
				this._fullviewButton = this.dom`<a class="ui icon button fullview"><i class="zoom icon"></i></a>`;
				this.appendChild(this._fullviewButton);
				this._fullviewButton.addEventListener('click', function(e) {
					this.ownerDocument.body.classList.toggle('fullview');
					this.carousel.resize();
				}.bind(this), false);
			}
		} else if (this._fullviewButton) {
			this._fullviewButton.remove();
			delete this._fullviewButton;
		}
	}

	_teardown() {
		if (this.carousel) {
			this.carousel.off('select', this._saveIndex);
			this.carousel.destroy();
			delete this.carousel;
		}
		this.ownerDocument.body.classList.remove('fullview');
	}

	_saveIndex(e) {
		this._options.initialIndex = this.carousel.selectedIndex;
	}

	connectedCallback() {
		this._setup();
	}

	disconnectedCallback() {
		this._teardown();
	}

	configure() {
		var changed = false;
		// TODO this ain't right buddy
		// we have the schema that could convert data props for us
		var opts = {
			pageDots: this.dataset.pageDots == "true",
			autoPlay: parseFloat(this.dataset.autoPlay) * 1000 || false,
			draggable: this.dataset.draggable != "false",
			prevNextButtons: this.dataset.prevNextButtons == "true",
			initialIndex: parseInt(this.dataset.initialIndex) || 0,
			width: this.dataset.width,
			height: this.dataset.height
		};

		for (var k in opts) {
			if (opts[k] !== this._options[k]) {
				changed = true;
				this._options[k] = opts[k];
			}
		}
		return changed;
	}

	update() {
		this._setup();
	}
}

class HTMLElementCarouselCell extends HTMLCustomElement {
	connectedCallback() {
		this.carousel = this.closest('element-carousel');
		this.update();
		if (this.carousel) {
			this.carousel.update();
		}
	}

	disconnectedCallback() {
		if (this.carousel) {
			this.carousel.update();
			delete this.carousel;
		}
	}

	update() {
		var width = parseFloat(this.dataset.width) || 0;
		if (width) this.style.width = `${width}%`;
		else this.style.width = null;
		var height = parseFloat(this.dataset.height) || 0;
		if (height) this.style.height = `${height}vh`;
		else this.style.height = null;
	}
}

Page.setup(function() {
	window.customElements.define('element-carousel', HTMLElementCarousel);
	window.customElements.define('element-carousel-cell', HTMLElementCarouselCell);
});

