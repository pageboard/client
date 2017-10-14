class HTMLElementGallery extends HTMLElement {
	constructor() {
		super();
		this._switchListener = this._switchListener.bind(this);
		if (!window.parent.Pageboard) {
			return;
		}
		this._sync = window.parent.Pageboard.Debounce(this._sync, 200);
		this.menuObserver = new MutationObserver(function(mutations) {
			this._setupMenu();
		}.bind(this));
		this.itemsObserver = new MutationObserver(function(mutations) {
			// we NEED to use href as key
			var doSync = false;
			var sel = '[block-content="items"],[block-type="image"]';
			if (mutations.some(function(rec) {
				return rec.type == "childList" && rec.target.matches(sel);
			})) this._sync();
		}.bind(this));
	}

	get showMenu() {
		return this.dataset.showMenu != null && this.dataset.showMenu != "false";
	}

	set showMenu(val) {
		this.dataset.showMenu = '' + !!val;
	}

	_setup() {
		this.menuObserver.observe(this.lastElementChild, {childList: true});
		this._initGallery();
	}
	_teardown() {
		this.menuObserver.disconnect();
		this.itemsObserver.disconnect();
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
		this._initGallery();
	}

	_initGallery() {
		this._editor = window.parent.Pageboard && window.parent.Pageboard.editor;
		if (!this._editor) return;
		var node = this._gallery;
		if (!node) return;
		this.itemsObserver.disconnect();
		this.itemsObserver.observe(node, {
			childList: true,
			subtree: true
		});
		var cache = {};
		var bmg = this._editor.blocks;
		Array.prototype.forEach.call(this._selectMedias(node), function(image) {
			var block = bmg.get(image.getAttribute('block-id'));
			cache[block.id] = block.data.url;
		});
		this._cache = cache;
	}

	_updateGalleries() {
		this._galleries = Array.prototype.slice.call(this.lastElementChild.children);
	}

	connectedCallback() {
		this._setupMenu();
		if (window.parent.Pageboard) {
			this._editor = window.parent.Pageboard.editor;
			this._setup();
		}
	}

	disconnectedCallback() {
		this._teardownMenu();
		if (window.parent.Pageboard) this._teardown();
	}

	_setupMenu() {
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
		this._setup();
		this._setupMenu();
	}

	_selectMedias(gal) {
		return gal.querySelectorAll('[block-content="media"] > .image');
	}

	_sync() {
		if (this._syncing || !this._gallery || !this._editor) return;
		this._syncing = true;
		var selItems = '[block-content="items"]';
		var map = Array.prototype.map;
		var gallery = this._gallery;
		var dstList = this._selectMedias(gallery)
		var cache = this._cache;
		var editor = this._editor;

		this._galleries.forEach(function(gal) {
			if (gal == gallery) return;
			var blockType = gal.getAttribute('block-type');
			var srcList = this._selectMedias(gal)
			var srcParent = gal.matches(selItems) ? gal : gal.querySelector(selItems);
			if (!srcParent) return;
			Dift.default(srcList, dstList, function(type, dest, src, pos) {
				var destBlock = dest && editor.blocks.get(dest.getAttribute('block-id'));
				var srcBlock = src && editor.blocks.get(src.getAttribute('block-id'));
				switch (type) {
				case Dift.CREATE: // 0, dest = null, src = newItem, pos = positionToCreate
					var destItemBlock = editor.blocks.create(`${blockType}_item`);
					var destItem = editor.render(destItemBlock);
					destBlock = editor.blocks.copy(srcBlock);
					delete destBlock.id;
					editor.blocks.set(destBlock);

					destItem.querySelector('[block-content="media"]')
						.appendChild(editor.render(destBlock));
					srcParent.insertBefore(destItem, srcParent.children[pos] || null);
					break;
				case Dift.UPDATE: // 1, dest = oldItem, src = newItem, pos is null
						if (cache[srcBlock.id] != cache[destBlock.id]) {
							if (srcBlock.data.url != destBlock.data.url) {
								destBlock.data.url = srcBlock.data.url
								editor.utils.refresh(dest, destBlock);
								cache[destBlock.id] = destBlock.data.url;
							}
						}
					break;
				case Dift.MOVE: // 2, dest = oldItem, src = newItem, pos = newPosition
					srcParent.insertBefore(
						dest.parentNode.closest('[block-type]'),
						srcParent.children[pos] || null
					);
					break;
				case Dift.REMOVE: // 3, dest = oldItem
					dest.parentNode.closest('[block-type]').remove();
					break;
				}
			}, function(node) {
				var id = node.getAttribute('block-id');
				if (cache[id]) return cache[id];
				var block = editor.blocks.get(id);
				return block.data.url;
			});
		}, this);

		this._syncing = false;
	}
}

Page.setup(function() {
	window.customElements.define('element-gallery', HTMLElementGallery);
});

