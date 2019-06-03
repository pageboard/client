class HTMLElementCarousel extends HTMLCustomElement {
	init(state) {
		this.refresh = Pageboard.debounce(this.refresh, 10);
		this.reload = Pageboard.debounce(this.reload, 100);
		this.options = this.parseOpts();
	}

	handleClick(e, state) {
		var node = this.lastElementChild;
		if (node.matches('a.fullview') && node.contains(e.target)) {
			e.stopImmediatePropagation();
			state.push({query:{
				[`${this.id}.fullview`]: !this.options.fullview
			}});
		}
	}

	setup(state) {
		this.options = this.parseOpts(state.options(this.id, ['index', 'fullview']));
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
		var opts = Object.assign({}, this.options, {
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
		this.ownerDocument.body.classList.toggle('fullview', this.options.fullview);
		this.classList.toggle('fade', this.options.fade);
		this.updateCells();
		this.carousel = new window.Flickity(this, opts);
		this.carousel.on('select', (e) => {
			this.dataset.index = this.carousel.selectedIndex;
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

	parseOpts(obj) {
		var src = this.dataset;
		if (src.initialFullview) src.fullview = src.initialFullview;
		else src.initialFullview = src.fullview || 'false';
		obj = Object.assign(src, obj);
		return {
			wrapAround: obj.wrapAround == "true",
			groupCells: obj.groupCells == "true",
			pageDots: obj.pageDots == "true",
			autoPlay: parseFloat(obj.autoPlay) * 1000 || false,
			draggable: obj.draggable != "false",
			prevNextButtons: obj.prevNextButtons == "true",
			initialIndex: parseInt(obj.index) || 0,
			width: obj.width,
			height: obj.height,
			fullview: obj.fullview == "true",
			fullviewButton: obj.fullviewButton == "true",
			imagesLoaded: obj.width == "auto",
			fade: obj.fade == "true"
		};
	}
	patch(state) {
		this.options = this.parseOpts(state.options(this.id, ['index', 'fullview']));
		if (this.lastElementChild.matches('a.fullview')) {
			this.lastElementChild.remove();
		}
		if (this.options.fullviewButton) this.insertAdjacentHTML(
			'beforeEnd',
			`<a class="ui icon button fullview"><i class="zoom icon"></i></a>`
		);
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
})

