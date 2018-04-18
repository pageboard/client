class HTMLElementCarousel extends HTMLCustomElement {
	init() {
		this._options = {
			noDomMod: true,
			wrapAround: false,
			lazyLoad: false, // unless element-image populates the right attribute for carousel
			cellSelector: 'element-carousel-cell',
			adaptativeHeight: false,
			initialIndex: 0,
			imagesLoaded: false,
			cellAlign: 'left',
			contain: true
		};
		this._saveIndex = this._saveIndex.bind(this);
	}

	_setup(opts) {
		var gallery = this.closest('element-gallery');
		if (gallery && gallery.dataset.mode != "carousel") return;
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
		this.updateCells();
		opts = Object.assign({}, this._options, opts);
		if (opts.fullview) {
			this.ownerDocument.body.classList.add('fullview');
		}
		this.carousel = new Flickity(this, opts);
		this.carousel.on('select', this._saveIndex);

		if (this.dataset.fullviewButton == "true") {
			if (!this._fullviewButton) {
				this._fullviewButton = this.ownerDocument.createElement('a');
				this._fullviewButton.innerHTML = '<i class="zoom icon"></i>';
				this._fullviewButton.className = 'ui icon button fullview';
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
		if (this.carousel) this._options.initialIndex = this.carousel.selectedIndex;
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
			wrapAround: this.dataset.wrapAround == "true",
			groupCells: this.dataset.groupCells == "true",
			pageDots: this.dataset.pageDots == "true",
			autoPlay: parseFloat(this.dataset.autoPlay) * 1000 || false,
			draggable: this.dataset.draggable != "false",
			prevNextButtons: this.dataset.prevNextButtons == "true",
			initialIndex: parseInt(this.dataset.initialIndex) || 0,
			width: this.dataset.width,
			height: this.dataset.height,
			imagesLoaded: this.dataset.width != "auto",
			adaptativeHeight: this.dataset.height != "auto"
		};
		if (document.body.isContentEditable) {
			opts.autoPlay = 0;
			opts.draggable = false;
			opts.wrapAround = false;
			opts.accessibility = false;
		}

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
	updateCells() {
		Array.prototype.forEach.call(
			this.querySelectorAll('element-carousel-cell'),
			function(cell) {
				cell.dataset.width = this._options.width;
				cell.dataset.height = this._options.height;
				if (cell.update) cell.update();
			},
			this
		);
	}
	refresh() {
		this.updateCells();
		if (this.carousel) {
			this.carousel.reloadCells();
			this.carousel.resize();
			this.carousel.positionCells();
		}
	}
}

class HTMLElementCarouselCell extends HTMLCustomElement {
	connectedCallback() {
		this.carousel = this.closest('element-carousel');
		this.update();
		if (this.carousel) {
			this.carousel.refresh();
		}
	}

	disconnectedCallback() {
		if (this.carousel) {
			this.carousel.refresh();
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
	HTMLCustomElement.define('element-carousel', HTMLElementCarousel);
	HTMLCustomElement.define('element-carousel-cell', HTMLElementCarouselCell);
});

