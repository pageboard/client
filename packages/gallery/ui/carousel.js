class HTMLElementCarousel extends HTMLCustomElement {
	static get defaults() {
		return {
			wrapAround: false,
			groupCells: false,
			pageDots: false,
			autoPlay: (x) => (parseFloat(x) || 0) * 1000,
			draggable: true,
			prevNextButtons: false,
			index: (x) => parseInt(x) || 0,
			width: null,
			height: null,
			fullview: false,
			fullviewButton: false,
			fade: false
		};
	}

	fullview(val) {
		this.classList.toggle('fullview', !!val);
		var body = this.ownerDocument.body;
		var len = body.querySelectorAll('element-carousel.fullview').length;
		body.classList.toggle('fullview', len >= 1);
	}

	init() {
		this.refresh = Pageboard.debounce(this.refresh, 10);
		this.reload = Pageboard.debounce(this.reload, 100);
		this.resetup = Pageboard.debounce(this.resetup, 100);
	}

	handleClick(e, state) {
		var node = e.target.closest('a.fullview');
		if (node) {
			e.stopImmediatePropagation();
			var query = Object.assign({}, state.query);
			var keyFv = `${this.id}.fullview`;
			if (this.options.fullview) {
				delete query[keyFv];
			} else {
				query[keyFv] = true;
			}
			var gallery = this.closest('[block-type="gallery"]');
			if (gallery) {
				// leaving current mode
				delete query[`${gallery.id}.mode`];
			}
			state.push({query: query});
		}
	}

	patch(state) {
		Page.setup((state) => {
			this.resetup(state);
		});
	}

	setup(state) {
		this.resetup(state);
	}

	resetup(state) {
		if (this.widget) this.destroy();
		var gallery = this.closest('[block-type="gallery"]');
		if (gallery && gallery.selectedMode != "carousel") return;
		var opts = Object.assign({}, this.options, {
			noDomMod: true,
			lazyLoad: false, // unless element-image populates the right attribute for carousel
			cellSelector: 'element-carousel-cell',
			adaptativeHeight: false,
			cellAlign: 'left',
			contain: true
		}, this.isContentEditable ? {
			autoPlay: 0,
			draggable: false,
			wrapAround: false,
			accessibility: false
		}: {});
		opts.initialIndex = opts.index;
		opts.imagesLoaded = opts.width == "auto";
		if (opts.autoPlay) opts.wrapAround = true;

		this.fullview(opts.fullview);
		this.classList.toggle('fade', opts.fade);

		this.updateCells();
		this.widget = new window.Flickity(this, opts);
		this.widget.on('select', (e) => {
			if (opts.fullview) {
				state.query[`${this.id}.index`] = this.widget.selectedIndex || undefined;
				state.save();
			}
		});
	}

	destroy() {
		if (this.widget) {
			this.widget.stopPlayer();
			this.widget.destroy();
		}
		this.fullview(false);
	}

	close(state) {
		this.destroy();
	}

	updateCells() {
		var opts = this.options;
		Array.prototype.forEach.call(
			this.querySelectorAll('element-carousel-cell'),
			function(cell) {
				cell.dataset.width = opts.width;
				cell.dataset.height = opts.height;
				if (cell.update) cell.update();
			},
			this
		);
	}
	refresh() {
		if (this.widget) {
			this.widget.resize();
		}
	}
	reload() {
		this.updateCells();
		if (this.widget) {
			this.widget.reloadCells();
			this.widget.resize();
		}
	}
}

class HTMLElementCarouselCell extends HTMLCustomElement {
	setup(state) {
		this.update();
		this.carousel = this.closest('element-carousel');
		if (this.carousel) {
			this.carousel.reload();
		}
	}

	close(state) {
		if (this.carousel) {
			this.carousel.reload(state);
			delete this.carousel;
		}
	}

	captureLoad(state) {
		if (this.carousel) this.carousel.refresh();
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

Page.ready(function() {
	HTMLCustomElement.define('element-carousel', HTMLElementCarousel);
});
Page.setup(function() {
	HTMLCustomElement.define('element-carousel-cell', HTMLElementCarouselCell);
});

