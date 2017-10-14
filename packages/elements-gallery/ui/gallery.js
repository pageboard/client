class HTMLElementGallery extends HTMLElement {
	constructor() {
		super();
		this._init();
	}

	_init() {
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
		Array.prototype.forEach.call(this._galleryMenu.children, function(node) {
			node.classList.remove('active');
		});
		target.classList.add('active');
		var mode = this.dataset.mode = target.dataset.mode;
		this._galleries.forEach(function(node) {
			if (node._teardown) node._teardown();
			if (node.getAttribute('block-type') == mode) {
				if (node._setup) node._setup();
				this._gallery = node;
			}
		}, this);
	}

	connectedCallback() {
		this._setup();
	}

	disconnectedCallback() {
		this._teardown();
	}

	_setup() {
		this._galleries = Array.prototype.slice.call(this.lastElementChild.children);
		if (!this._galleries.length) return;
		var mode = this.dataset.mode;
		this._gallery = this._galleries.find(function(gal) {
			return gal.getAttribute('block-type') == mode;
		});
		if (!this._gallery || !mode) {
			this._gallery = this._galleries[0];
			mode = this.dataset.mode = this._gallery.getAttribute('block-type');
		}
		this._galleryMenu = this.firstElementChild.matches('.menu') ? this.firstElementChild : null;
		if (this.showMenu) {
			if (!this._galleryMenu) {
				this._galleryMenu = this.dom`<div class="ui tiny compact icon menu"></div>`;
				this.insertBefore(this._galleryMenu, this.firstElementChild);
				this._galleryMenu.addEventListener('click', this._switchListener, false);
			}
			this._galleryMenu.textContent = "";
			this._galleries.forEach(function(node) {
				var type = node.getAttribute('block-type');
				this._galleryMenu.appendChild(node.dom`<a class="icon item ${mode == type ? 'active' : ''}" data-mode="${type}"><i class="${type} icon"></i></a>`);
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

Page.setup(function() {
	window.customElements.define('element-gallery', HTMLElementGallery);
});

