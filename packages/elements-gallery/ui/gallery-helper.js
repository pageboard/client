Page.setup(function() {
	var Proto = window.HTMLElementGallery.prototype;
	var Diff = window.listDiff;
	Proto._init = Proto.init;
	Proto.init = function() {
		this._init();
		var setMode = this.setMode;
		this.setMode = function(mode) {
			setMode.call(this, mode);
			this._syncGallery();
		}.bind(this);
		this._initHelper();
		this._itemClick = function() {}; // do nothing
	};

	Proto.connectedCallback = function() {
		this._setup();
		if (window.parent.Pageboard.editor) this._setupHelper();
	};

	Proto.disconnectedCallback = function() {
		this._teardown();
		this._teardownHelper();
	};

	Proto._syncGallery = function() {
		var node = this._gallery;
		if (!node) return;
		this.itemsObserver.disconnect();
		this.itemsObserver.observe(node, {
			childList: true,
			subtree: true
		});
	};

	Proto._initHelper = function() {
		if (this._syncAfter) return;
		this._syncAfter = window.parent.Pageboard.debounce(this._sync, 200);
		this.menuObserver = new MutationObserver(function(mutations) {
			this._setup();
			this._syncAfter();
		}.bind(this));

		this.itemsObserver = new MutationObserver(function(mutations) {
			// we NEED to use href as key
			var blockType = this._gallery.getAttribute('block-type');

			var sel = '[block-content="items"],[block-type="image"]';
			if (mutations.some(function(rec) {
				return rec.type == "childList" && rec.target.matches(sel) && rec.target.closest(`[block-type="${blockType}"]`);
			})) {
				this._syncAfter();
			}
		}.bind(this));
	};

	Proto._selectMedias = function(gal) {
		var editor = this._editor;
		return Array.from(gal.querySelectorAll('[block-content="media"] > [block-type="image"]'))
		.map(function(node, i) {
			var block = editor.blocks.get(node.getAttribute('block-id'));
			return {
				pos: i,
				block: block,
				url: block.data.url || ""
			};
		});
	};

	Proto._setupHelper = function() {
		this._editor = window.parent.Pageboard.editor;
		this.menuObserver.observe(this.lastElementChild, {childList: true});
		this._syncGallery();
	};

	Proto._teardownHelper = function() {
		this.menuObserver.disconnect();
		this.itemsObserver.disconnect();
	};

	function getPosDest(parent, blockType, pos) {
		var list = parent.querySelectorAll(`[block-type="${blockType}_item"]`);
		if (list.length > pos) return list.item(pos);
	}

	Proto._sync = function() {
		if (window.HTMLElementGallery.disabled) return;
		if (this._syncing || !this._gallery || !this._editor) return;
		this._syncing = true;
		var selItems = '[block-content="items"]';
		var gallery = this._gallery;
		var curList = this._selectMedias(gallery);
		var editor = this._editor;

		this._galleries.forEach(function(gal) {
			if (gal == gallery) return;
			var oldType = gal.getAttribute('block-type');
			var oldList = this._selectMedias(gal);
			var oldParent = gal.matches(selItems) ? gal : gal.querySelector(selItems);
			if (!oldParent) return;
			// a move is: remove + create of the same url
			var removedItem;
			var tr = editor.state.tr;
			var patches = Diff(oldList, curList, "url");
			var sel, oldBlock, oldNode, curBlock;
			patches.forEach(function(patch) {
				switch (patch.type) {
				case Diff.INSERTION:
					// move selection to position
					var atEnd = patch.index == oldList.length;
					var toNode = getPosDest(oldParent, oldType, atEnd ? patch.index - 1 : patch.index);
					sel = editor.utils.selectTr(tr, toNode, true);
					var pos = atEnd ? sel.to + 1 : sel.from - 1;
					var $pos = tr.doc.resolve(pos);
					var node;
					if (removedItem && patch.item.url == removedItem.url) {
						node = removedItem.node;
					} else {
						var block = editor.blocks.create(`${oldType}_item`);
						editor.blocks.set(block);
						var dom = editor.render(block);
						curBlock = patch.item && patch.item.block;
						if (curBlock) {
							oldBlock = editor.blocks.copy(curBlock);
							delete oldBlock.id;
							editor.blocks.set(oldBlock);
							dom.querySelector('[block-content="media"]').appendChild(editor.render(oldBlock));
						}
						node = editor.utils.fill(editor.utils.parseTr(tr, dom, $pos).content.firstChild);
					}
					tr.insert(pos, node);
					removedItem = null;
					break;
				case Diff.SUBSTITUTION:
					oldBlock = oldList[patch.index].block;
					curBlock = curList[patch.item.pos].block;
					if (curBlock.data.url != oldBlock.data.url) {
						oldBlock.data.url = curBlock.data.url;
						oldNode = getPosDest(oldParent, oldType, patch.index).querySelector('[block-type="image"]');
						editor.utils.refreshTr(tr, oldNode, oldBlock);
					}
					break;
				case Diff.DELETION:
					oldNode = getPosDest(oldParent, oldType, patch.index);
					sel = editor.utils.selectTr(tr, oldNode);
					removedItem = {
						node: sel.node,
						url: oldList[patch.index].url
					};
					editor.utils.deleteTr(tr, sel);
					break;
				}

			});
			if (patches.length) {
				editor.dispatch(tr);
			}
		}, this);

		this._syncing = false;
	};
});
