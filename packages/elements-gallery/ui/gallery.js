class HTMLElementGallery extends HTMLElement {
	constructor() {
		super();
		this._switchListener = this._switchListener.bind(this);
		if (!window.parent.Pageboard) return;
		this._sync = window.parent.Pageboard.Debounce(this._sync, 200);
		this.menuObserver = new MutationObserver(function(mutations) {
			this._setupMenu();
		}.bind(this));
		this.itemsObserver = new MutationObserver(function(mutations) {
			var inContent = mutations.some(function(rec) {
				return rec.type == "childList" && rec.target.matches('[block-type="image"]');
			});
			if (inContent) this._sync();
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
		this.itemsObserver.observe(this.lastElementChild, {childList: true, subtree: true});
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
			if (node.getAttribute('block-type') == mode && node._setup) node._setup();
		});
	}

	_updateGalleries() {
		this._galleries = Array.prototype.slice.call(this.lastElementChild.children);
	}

	connectedCallback() {
		this._setupMenu();
		if (window.parent.Pageboard) this._setup();
	}

	disconnectedCallback() {
		this._teardownMenu();
		if (window.parent.Pageboard) this._teardown();
	}

	_setupMenu() {
		this._galleries = Array.prototype.slice.call(this.lastElementChild.children);
		if (!this._galleries.length) return;
		if (!this._galleries.some(function(gal) {
			return gal.getAttribute('block-type') == this.dataset.mode;
		}, this)) this.dataset.mode = "";
		if (!this.dataset.mode) {
			this.dataset.mode = this._galleries[0].getAttribute('block-type');
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
				this._galleryMenu.appendChild(node.dom`<a class="icon item ${this.dataset.mode == type ? 'active' : ''}" data-mode="${type}"><i class="${type} icon"></i></a>`);
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

	_sync() {
		if (this._syncing) return;
		var editor = window.parent.Pageboard && window.parent.Pageboard.editor;
		if (!editor) return;
		var gallery = this.querySelector(`[block-type="${this.dataset.mode}"]`);
		if (!gallery) return;
		this._syncing = true;
		var sel = '[block-content="media"] > .image';
		var selItems = '[block-content="items"]';
		var map = Array.prototype.map;
		var dstList = gallery.querySelectorAll(sel);

		this._galleries.forEach(function(gal) {
			if (gal == gallery) return;
			var blockType = gal.getAttribute('block-type');
			var srcList = gal.querySelectorAll(sel);
			var srcParent = gal.matches(selItems) ? gal : gal.querySelector(selItems);
			if (!srcParent) return;
			Dift.default(srcList, dstList, function(type, prev, next, pos) {
				switch (type) {
					case Dift.CREATE: // 0, prev = null, next = newItem, pos = positionToCreate
					var block = editor.blocks.create(`${blockType}_item`);
					var node = editor.render(block);
					var subblock = editor.blocks.create(next.getAttribute('block-type'));
					subblock.data.url = getKey(next);

					editor.blocks.set(subblock);
					node.querySelector('[block-content="media"]').appendChild(editor.render(subblock));
					srcParent.insertBefore(node, srcParent.children[pos] || null);
					break;
					case Dift.UPDATE: // 1, prev = oldItem, next = newItem, pos is null
					if (getKey(prev) == getKey(next)) return;
					var copy = prev.cloneNode(true);
					copy.innerHTML = next.innerHTML;
					prev.parentNode.replaceChild(copy, prev);
					break;
					case Dift.MOVE: // 2, prev = oldItem, next = newItem, pos = newPosition
					// move seems to be update + move
					if (getKey(prev) != getKey(next)) {
						prev.innerHTML = next.innerHTML;
					}
					srcParent.insertBefore(prev, srcParent.children[pos] || null);
					break;
					case Dift.REMOVE: // 3, prev = oldItem
					prev.parentNode.closest('[block-type]').remove();
					break;
				}
			}, getKey);
		});

		this._syncing = false;

		function getKey(node) {
			return node.querySelector('img').getAttribute('src');
		}

		function childPos(node) {
			var pos = 0;
			while (node=node.prevSibling) pos++;
			return pos;
		}

		function copyItem(node) {
			var copy = node.cloneNode(true);
			copy.removeAttribute('block-id');
			return copy;
		}
	}
}


Page.setup(function() {
	window.customElements.define('element-gallery', HTMLElementGallery);
});

