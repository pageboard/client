class HTMLElementGallery extends HTMLCustomElement {
	init() {
		this.options = this.parseOpts();
	}

	patch(state) {
		this.options = this.parseOpts(state.options(this.id, ['mode']));
		this.initGalleries();
	}

	parseOpts(obj) {
		var src = this.dataset;
		if (src.initialMode) src.mode = src.initialMode;
		else if (src.mode) src.initialMode = src.mode;
		return obj ? Object.assign({}, src, obj) : src;
	}

	get galleries() {
		var last = this.lastElementChild;
		if (last) return Array.from(last.children);
		else return [];
	}

	initGalleries() {
		var curGal = this.activeGallery || this.galleries[0];
		var curMode = curGal.getAttribute('block-type');
		var mode = this.options.mode || curMode;
		if (curMode == mode && this.activeGallery) return;

		this.galleries.forEach(function(gal) {
			if (gal.getAttribute('block-type') == mode) {
				curGal = gal;
			} else if (gal.destroy) {
				gal.destroy();
			}
		}, this);
		if (!curGal) {
			return;
		}
		this.activeGallery = curGal;
		this.options.mode = this.dataset.mode = mode;
		var menu = this.firstElementChild;
		Array.from(menu.children).forEach(function(node) {
			node.classList.remove('active');
		});
		var item = menu.querySelector(`[data-mode="${mode}"]`);
		if (item) item.classList.add('active');
		
		if (this.activeGallery.setup) Page.setup((state) => {
			this.activeGallery.setup(state);
		});
	}

	handleClick(e, state) {
		var item = e.target.closest('a');
		if (item) {
			if (item.dataset.mode != this.options.mode) {
				state.push({query: {
					[`${this.id}.mode`]: item.dataset.mode
				}});
			}
			return;
		}
		item = e.target.closest('[block-type="portfolio_item"],[block-type="medialist_item"]');
		if (!item) return;
		if (item.matches('[block-type="medialist_item"]') && !e.target.closest('[block-content="media"]')) {
			// only allow click on medialist's media
			return;
		}
		var carousel = this.galleries.find(function(gal) {
			return gal.getAttribute('block-type') == "carousel";
		});
		if (!carousel) return;
		var position = 0;
		while ((item=item.previousSibling)) position++;
		state.push({query: {
			[`${this.id}.mode`]: 'carousel',
			[`${carousel.id}.index`]: position,
			[`${carousel.id}.fullview`]: true
		}});
	}

	setup() {
		var menu = this.firstElementChild;
		menu.textContent = "";
		var gals = this.galleries;
		if (gals.length > 1) {
			var mode = this.options.mode;
			gals.forEach(function(node) {
				var type = node.getAttribute('block-type');
				var active = mode == type ? 'active' : '';
				menu.insertAdjacentHTML(
					"beforeEnd",
					`<a class="icon item ${active}" data-mode="${type}">
						<i class="${type} icon"></i>
					</a>`
				);
			}, this);
		}
		if (gals.length) this.initGalleries();
	}
}
HTMLCustomElement.define('element-gallery', HTMLElementGallery);
