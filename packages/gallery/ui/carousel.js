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
			width: (x) => (parseFloat(x) || null),
			height: (str) => {
				if ((parseFloat(str) || 0) == 0) return null;
				else return str;
			},
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
		this.updateCells();
		Page.setup((state) => {
			this.resetup(state);
		});
	}

	setup(state) {
		this.resetup(state);
		if (!this.itemsObserver) {
			this.itemsObserver = new MutationObserver((records) => {
				records.forEach((record) => this.reload(record, state));
			});
			this.itemsObserver.observe(this.querySelector('[block-content="items"]'), {
				childList: true
			});
		}
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
		opts.imagesLoaded = opts.width == null;
		if (opts.autoPlay) opts.wrapAround = true;

		this.fullview(opts.fullview);
		this.classList.toggle('fade', opts.fade);

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
		if (this.itemsObserver) {
			this.itemsObserver.disconnect();
			delete this.itemsObserver;
		}
	}

	updateCells() {
		var opts = this.options;
		Array.prototype.forEach.call(
			this.querySelectorAll('element-carousel-cell'),
			function(cell) {
				if (opts.width) cell.dataset.width = opts.width + '%';
				else delete cell.dataset.width;
				if (opts.height) cell.dataset.height = opts.height;
				else delete cell.dataset.height;
			},
			this
		);
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
	static get defaults() {
		return {
			width: null,
			height: null
		};
	}
	updateStyle() {
		this.style.width = this.options.width;
		this.style.height = this.options.height;
	}
	patch(state) {
		this.updateStyle();
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-carousel-cell', HTMLElementCarouselCell);
	HTMLCustomElement.define('element-carousel', HTMLElementCarousel);
});

Page.setup(function(state) {
	function modabs(i, l) {
		return ((i % l) + l) % l;
	}
	function flickLazy(i, isWrap, instant) {
		if (this.options.wrapAround || isWrap ) {
			i = modabs(i, this.slides.length);
		}
		var slide = this.slides[i];
		if (!slide) return;
		var lazies = [];
		slide.cells.forEach((cell) => {
			Array.from(cell.element.querySelectorAll("[data-src]")).forEach((node) => {
				if (node.reveal && !node.currentSrc) {
					lazies.push(node.reveal(state).catch(() => {}));
				}
			});
		});

		return Promise.all(lazies).then(() => {
			this.select(i, isWrap, instant);
		});
	}
	window.Flickity.prototype.next = function(isWrap, i) {
		return flickLazy.call(this, this.selectedIndex + 1, isWrap, i);
	};
	window.Flickity.prototype.previous = function(isWrap, i) {
		return flickLazy.call(this, this.selectedIndex - 1, isWrap, i);
	};
});
