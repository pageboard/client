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
	static get observedAttributes() {
		return Object.keys(this.defaults).map(function(x) {
			return 'data-' + x.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
		});
	}

	options(state) {
		var defs = this.constructor.defaults;
		var list = Object.keys(defs);
		var data = Object.assign({}, this.dataset, state ? state.options(this.id, list) : null);
		var opts = {};
		list.forEach((key) => {
			var def = defs[key];
			var val = data[key];
			if (typeof def == "function") {
				val = def(val);
			}	else if (typeof def == "boolean") {
				if (def === true) val = val != "false";
				else val = val == "true";
			} else if (typeof def == "number") {
				val = parseFloat(val);
			}
			if (val != null) opts[key] = val;
		});
		return opts;
	}

	init(state) {
		this.refresh = Pageboard.debounce(this.refresh, 10);
		this.reload = Pageboard.debounce(this.reload, 100);
	}

	handleClick(e, state) {
		var node = this.lastElementChild;
		if (node.matches('a.fullview') && node.contains(e.target)) {
			e.stopImmediatePropagation();
			state.push({query:{
				[`${this.id}.fullview`]: !this.options(state).fullview
			}});
		}
	}

	setup(state) {
		if (this.carousel) {
			this.destroy();
		} else {
			// because the element might have been setup on server
			Array.from(this.querySelectorAll(
				'.flickity-prev-next-button,.flickity-page-dots'
			)).forEach(function(node) {
				node.remove();
			});
		}
		var gallery = this.closest('element-gallery');
		if (gallery && gallery.options.mode != "carousel") return;
		var opts = Object.assign(this.options(state), {
			noDomMod: true,
			lazyLoad: false, // unless element-image populates the right attribute for carousel
			cellSelector: 'element-carousel-cell',
			adaptativeHeight: false,
			cellAlign: 'left',
			contain: true
		}, document.body.isContentEditable ? {
			autoPlay: 0,
			draggable: false,
			wrapAround: false,
			accessibility: false
		}: {});
		opts.initialIndex = opts.index;
		opts.imagesLoaded = opts.width == "auto";

		this.ownerDocument.body.classList.toggle('fullview', opts.fullview);
		if (opts.fullviewButton) this.insertAdjacentHTML(
			'beforeEnd',
			`<a class="ui icon button fullview"><i class="zoom icon"></i></a>`
		);
		else if (this.lastElementChild.matches('a.fullview')) {
			this.lastElementChild.remove();
		}
		this.classList.toggle('fade', opts.fade);
		this.updateCells();
		this.carousel = new window.Flickity(this, opts);
		this.carousel.on('select', (e) => {
			if (gallery) {
				state.query.index = this.id + '.' + this.carousel.selectedIndex;
				state.save();
			}
		});
	}

	destroy() {
		if (this.carousel) {
			this.carousel.stopPlayer();
			this.carousel.destroy();
		}
		this.ownerDocument.body.classList.remove('fullview');
	}

	close(state) {
		this.destroy();
	}

	patch(state) {
		Page.setup(this);
	}
	updateCells() {
		Array.prototype.forEach.call(
			this.querySelectorAll('element-carousel-cell'),
			function(cell) {
				cell.dataset.width = this.options.width;
				cell.dataset.height = this.options.height;
				if (cell.update) cell.update();
			},
			this
		);
	}
	refresh() {
		if (this.carousel) {
			this.carousel.resize();
		}
	}
	reload(state) {
		this.updateCells();
		if (this.carousel) {
			this.carousel.reloadCells();
			this.carousel.resize();
		}
	}
}

class HTMLElementCarouselCell extends HTMLCustomElement {
	setup(state) {
		this.update();
		this.carousel = this.closest('element-carousel');
		if (this.carousel) {
			this.carousel.reload(state);
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

