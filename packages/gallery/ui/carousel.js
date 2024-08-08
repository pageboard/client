class HTMLElementCarousel extends Page.Element {
	static defaults = {
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

	static setup(state) {
		function modabs(i, l) {
			return ((i % l) + l) % l;
		}
		async function flickLazy(i, isWrap, instant) {
			if (this.options.wrapAround || isWrap) {
				i = modabs(i, this.slides.length);
			}
			const slide = this.slides[i];
			if (!slide) return;
			const lazies = [];
			for (const cell of slide.cells) {
				for (const node of cell.element.querySelectorAll("[data-src]")) {
					if (node.reveal && !node.currentSrc) {
						lazies.push(node.reveal(state));
					}
				}
			}

			await Promise.allSettled(lazies);
			this.select(i, isWrap, instant);
		}
		Pageboard.Flickity.prototype.next = async function (isWrap, i) {
			return flickLazy.call(this, this.selectedIndex + 1, isWrap, i);
		};
		Pageboard.Flickity.prototype.previous = async function (isWrap, i) {
			return flickLazy.call(this, this.selectedIndex - 1, isWrap, i);
		};
	}

	reload = Page.debounce(() => this.#reload(), 100);

	fullview(val) {
		this.classList.toggle('fullview', Boolean(val));
		const body = this.ownerDocument.body;
		const len = body.querySelectorAll('element-carousel.fullview').length;
		body.classList.toggle('fullview', len >= 1);
	}

	handleClick(e, state) {
		// FIXME
		const node = e.target.closest('.fullview[role="button"]');
		if (!node) return;
		e.stopImmediatePropagation();
		const query = { ...state.query };
		const keyFv = `${this.id}.fullview`;
		const gallery = this.closest('[block-type="gallery"]');
		if (gallery) {
			// leaving current mode
			delete query[`${gallery.id}.mode`];
			delete query[`${this.id}.index`];
			delete query[keyFv];
		} else if (this.options.fullview) {
			delete query[keyFv];
		} else {
			query[keyFv] = true;
		}
		state.push({ query: query });
	}

	patch(state) {
		this.updateCells();
	}

	setup(state) {
		if (!this.itemsObserver) {
			this.itemsObserver = new MutationObserver(records => {
				for (const record of records) this.reload(record, state);
			});
			this.itemsObserver.observe(this.querySelector('[block-content="items"]'), {
				childList: true
			});
		}
	}

	paint(state) {
		const gallery = this.closest('[block-type="gallery"]');
		state.finish(() => {
			const enabled = !gallery || gallery.selectedMode == "carousel";
			if (enabled) {
				this.fullview(this.options.fullview);
				if (!this.widget) this.#create(state);
				else this.reload();
			} else if (this.widget) {
				this.destroy(state);
			}
		});
	}

	#create(state) {
		const opts = Object.assign({}, this.options, {
			noDomMod: true,
			lazyLoad: false, // unless element-image populates the right attribute for carousel
			cellSelector: 'element-carousel-cell',
			adaptativeHeight: false,
			cellAlign: 'left',
			contain: true
		}, state.scope.$write ? {
			autoPlay: 0,
			draggable: false,
			wrapAround: false,
			accessibility: false
		} : {});
		opts.initialIndex = opts.index;
		opts.imagesLoaded = opts.width == null;
		if (opts.autoPlay) opts.wrapAround = true;

		this.widget = new Pageboard.Flickity(this, opts);
		this.widget.on('change', (index) => {
			const gallery = this.closest('[block-type="gallery"]');
			const oldIndex = this.options.index;
			const oldSlide = this.widget.slides[oldIndex];
			if (oldSlide) {
				for (const cell of oldSlide.cells) {
					for (const node of cell.element.querySelectorAll('video,audio')) {
						if (node.pause) node.pause();
					}
				}
			}
			const newSlide = this.widget.slides[index];
			if (newSlide) {
				for (const cell of newSlide.cells) {
					for (const node of cell.element.querySelectorAll('video,audio')) {
						if (node.play && node.options.autoplay) node.play();
					}
				}
			}
			if (opts.fullview || gallery) {
				state.query[`${this.id}.index`] = index;
				state.save();
			} else {
				this.options.index = index;
			}
		});
	}

	destroy() {
		if (this.widget) {
			this.widget.stopPlayer();
			this.widget.destroy();
			this.widget = null;
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
		const opts = this.options;
		for (const cell of this.querySelectorAll('element-carousel-cell')) {
			if (opts.width) cell.style.width = opts.width + '%';
			else delete cell.style.width;
			if (opts.height) cell.style.height = opts.height;
			else delete cell.style.height;
		}
	}

	#reload() {
		this.updateCells();
		if (this.widget) {
			this.widget.reloadCells();
			this.widget.resize();
		}
	}
}

Page.define('element-carousel', HTMLElementCarousel);

