class HTMLElementGallery extends HTMLElement {
	constructor() {
		super();
	}

	get showMenu() {
		return this.dataset.showMenu != null && this.dataset.showMenu != "false";
	}

	set showMenu(val) {
		this.dataset.showMenu = '' + !!val;
	}

	_setup() {

	}

	_switchListener(e) {
		var target = e.target.closest('.item');
		if (!target || target.matches('.active')) return;

	}

	_teardown() {
	}

	connectedCallback() {
		this._setup();
		this._setupMenu();
	}

	disconnectedCallback() {
		this._teardown();
		this._teardownMenu();
	}

	_setupMenu() {
		this._galleryMenu = this.firstElementChild.matches('.menu') ? this.firstElementChild : null;
		if (this.showMenu) {
			if (!this._galleryMenu) {
				this._galleryMenu = this.dom`<div class="ui tiny compact icon menu">
					<a class="icon item active" data-mode="portfolio"><i class="grid icon"></i></a>
					<a class="icon item" data-mode="medialist"><i class="list icon"></i></a>
					<a class="icon item" data-mode="carousel"><i class="close icon"></i></a>
				</div>`;
				this.insertBefore(this._galleryMenu, this.firstElementChild);
			}
			this._galleryMenu.addEventListener('click', this._switchListener, false);
		} else {
			this._teardownMenu();
		}
	}

	_teardownMenu() {
		if (this._galleryMenu) {
			this._galleryMenu.removeEventListener('click', this._switchListener, false);
			this._galleryMenu.remove();
			delete this._galleryMenu;
		}
	}

	update() {
	}
}


Page.setup(function() {
	window.customElements.define('element-gallery', HTMLElementGallery);
});

