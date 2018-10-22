class HTMLElementGallery extends HTMLCustomElement {
	init() {
		this._itemClick = this._itemClick.bind(this);
		this._switchListener = this._switchListener.bind(this);
	}

	get showMenu() {
		return this.dataset.showMenu != null && this.dataset.showMenu != "false";
	}

	set showMenu(val) {
		this.dataset.showMenu = '' + !!val;
	}

	_switchListener(e) {
		var target = e.target.closest('.item');
		if (!target || target.matches('.active')) return;
		Page.push({query: {gallery: target.dataset.mode}});
	}

	setMode(mode) {
		var item = this._galleryMenu.querySelector(`.item[data-mode="${mode}"]`);
		if (!item) return;
		this._initGalleries({mode: mode});
	}

	connectedCallback() {
		this._setup();
	}

	disconnectedCallback() {
		this._teardown();
	}

	_initGalleries(opts) {
		if (!opts) opts = {};
		var mode = this.dataset.mode;
		if (opts.mode) {
			if (opts.mode == mode && this._gallery) return;
			this.dataset.mode = mode = opts.mode;
		}

		this._galleries.forEach(function(gal) {
			if (gal.getAttribute('block-type') == mode) {
				this._gallery = gal;
			} else if (gal._teardown) {
				gal._teardown();
			}
		}, this);
		if (!this._gallery || !mode) {
			this._gallery = this._galleries[0];
			mode = this.dataset.mode = this._gallery.getAttribute('block-type');
		}
		if (this._gallery._setup) this._gallery._setup(opts);
		if (this._galleryMenu) {
			Array.prototype.forEach.call(this._galleryMenu.children, function(node) {
				node.classList.remove('active');
			});
			var item = this._galleryMenu.querySelector(`[data-mode="${mode}"]`);
			if (item) item.classList.add('active');
		}
		if (mode != "carousel") {
			this._gallery.addEventListener('click', this._itemClick, false);
		} else {
			this._gallery.removeEventListener('click', this._itemClick, false);
		}
	}

	_itemClick(e) {
		if (e.target.closest('a')) return;
		var item = e.target.closest('[block-type="portfolio_item"],[block-type="medialist_item"]');
		if (!item) return;
		if (item.matches('[block-type="medialist_item"]') && !e.target.closest('[block-content="media"]')) {
			// only allow click on medialist's media
			return;
		}
		var carousel = this._galleries.find(function(gal) {
			return gal.getAttribute('block-type') == "carousel";
		});
		if (!carousel) return;
		this.dataset.mode = "carousel";
		var position = 0;
		while ((item=item.previousSibling)) position++;
		this._initGalleries({
			initialIndex: position,
			fullview: true
		});
	}

	_setup() {
		this._galleries = Array.prototype.slice.call(this.lastElementChild.children);
		if (!this._galleries.length) return;
		this._initGalleries({mode: this.dataset.mode || HTMLElementGallery.defaultMode(this)});
		this._galleryMenu = this.firstElementChild.matches('.menu') ? this.firstElementChild : null;
		if (this.showMenu) {
			if (!this._galleryMenu) {
				this._galleryMenu = this.ownerDocument.createElement("div");
				this._galleryMenu.className = "ui tiny compact icon menu";
				this.insertBefore(this._galleryMenu, this.firstElementChild);
				this._galleryMenu.addEventListener('click', this._switchListener, false);
			}
			this._galleryMenu.textContent = "";
			var mode = this.dataset.mode;
			this._galleries.forEach(function(node) {
				var type = node.getAttribute('block-type');
				this._galleryMenu.insertAdjacentHTML("beforeEnd", `<a class="icon item ${mode == type ? 'active' : ''}" data-mode="${type}"><i class="${type} icon"></i></a>`);
			}, this);
		} else {
			this._teardown();
		}
	}

	_teardown() {
		if (this._galleryMenu) {
			this._galleryMenu.removeEventListener('click', this._switchListener, false);
			this._galleryMenu.remove();
			delete this._galleryMenu;
		}
	}

	update() {
		this._setup();
	}
}

HTMLElementGallery.defaultMode = function(node) {
	if (node._defaultMode) return node._defaultMode;
	var last = node.lastElementChild;
	if (!last) return;
	var first = last.firstElementChild;
	if (!first) return;
	var mode = first.getAttribute('block-type');
	node._defaultMode = mode;
	return mode;
};

Page.setup(function(state) {
	window.HTMLElementGallery = HTMLCustomElement.define('element-gallery', HTMLElementGallery);
});

Page.patch(function(state) {
	// TODO support multiple galleries
	var gallery = document.querySelector('element-gallery');
	if (!gallery) return;
	var mode = state.query.gallery || HTMLElementGallery.defaultMode(gallery);
	if (gallery.setMode) gallery.setMode(mode);
	else gallery.dataset.mode = mode;
});

