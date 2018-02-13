HTMLElementGallery.prototype._init = HTMLElementGallery.prototype.init;
HTMLElementGallery.prototype.init = function() {
	this._init();
	var listener = this._switchListener;
	this._switchListener = function(e) {
		listener(e);
		this._syncGallery();
	}.bind(this);
	this._initHelper();
	this._itemClick = function() {}; // do nothing
};

HTMLElementGallery.prototype.connectedCallback = function() {
	this._setup();
	if (window.parent.Pageboard.editor) this._setupHelper();
};

HTMLElementGallery.prototype.disconnectedCallback = function() {
	this._teardown();
	this._teardownHelper();
};

HTMLElementGallery.prototype._syncGallery = function() {
	var node = this._gallery;
	if (!node) return;
	this.itemsObserver.disconnect();
	this.itemsObserver.observe(node, {
		childList: true,
		subtree: true
	});
};

HTMLElementGallery.prototype._initHelper = function() {
	if (this._syncAfter) return;
	this._syncAfter = window.parent.Pageboard.Debounce(this._sync, 200);
	this.menuObserver = new MutationObserver(function(mutations) {
		this._setup();
		this._syncAfter();
	}.bind(this));

	this.itemsObserver = new MutationObserver(function(mutations) {
		// we NEED to use href as key
		var blockType = this._gallery.getAttribute('block-type');

		var sel = '[block-content="items"],[block-type="image"]';
		if (mutations.some(function(rec) {
			return rec.type == "childList" && rec.target.matches(sel) && rec.target.closest(`[block-type="${blockType}"]`)
		})) {
			this._syncAfter();
		}
	}.bind(this));
};

HTMLElementGallery.prototype._selectMedias = function(gal) {
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

HTMLElementGallery.prototype._setupHelper = function() {
	this._editor = window.parent.Pageboard.editor;
	this.menuObserver.observe(this.lastElementChild, {childList: true});
	this._syncGallery();
};

HTMLElementGallery.prototype._teardownHelper = function() {
	this.menuObserver.disconnect();
	this.itemsObserver.disconnect();
};

function getPosDest(parent, blockType, pos) {
	var list = parent.querySelectorAll(`[block-type="${blockType}_item"]`);
	if (list.length > pos) return list.item(pos);
}

HTMLElementGallery.prototype._sync = function() {
	if (HTMLElementGallery.disabled) return;
	if (this._syncing || !this._gallery || !this._editor) return;
	this._syncing = true;
	var selItems = '[block-content="items"]';
	var map = Array.prototype.map;
	var gallery = this._gallery;
	var curList = this._selectMedias(gallery);
	var editor = this._editor;

	this._galleries.forEach(function(gal) {
		if (gal == gallery) return;
		var oldType = gal.getAttribute('block-type');
		var oldList = this._selectMedias(gal)
		var oldParent = gal.matches(selItems) ? gal : gal.querySelector(selItems);
		if (!oldParent) return;
		// a move is: remove + create of the same url
		var removedItem;
		var tr = editor.state.tr;
		var patches = listDiff(oldList, curList, "url");
		patches.forEach(function(patch) {
			switch (patch.type) {
			case listDiff.INSERTION:
				// move selection to position
				var atEnd = patch.index == oldList.length;
				var toNode = getPosDest(oldParent, oldType, atEnd ? patch.index - 1 : patch.index);
				var sel = editor.utils.selectTr(tr, toNode, true);
				var pos = atEnd ? sel.to + 1 : sel.from - 1;
				var $pos = tr.doc.resolve(pos);
				var node;
				if (removedItem && patch.item.url == removedItem.url) {
					node = removedItem.node;
				} else {
					var block = editor.blocks.create(`${oldType}_item`);
					editor.blocks.set(block);
					var dom = editor.render(block);
					var curBlock = patch.item && patch.item.block;
					if (curBlock) {
						var oldBlock = editor.blocks.copy(curBlock);
						delete oldBlock.id;
						editor.blocks.set(oldBlock);
						dom.querySelector('[block-content="media"]').appendChild(editor.render(oldBlock));
						dom.querySelector('[block-content="content"]').appendChild(dom.ownerDocument.createElement('p'));
					}
					node = editor.utils.parseTr(tr, dom, $pos).content.firstChild;
				}
				tr.insert(pos, node);
				removedItem = null;
				break;
			case listDiff.SUBSTITUTION:
				var oldBlock = oldList[patch.index].block;
				var curBlock = curList[patch.item.pos].block;
				if (curBlock.data.url != oldBlock.data.url) {
					oldBlock.data.url = curBlock.data.url;
					var oldNode = getPosDest(oldParent, oldType, patch.index).querySelector('[block-type="image"]');
					editor.utils.refreshTr(tr, oldNode, oldBlock);
				}
				break;
			case listDiff.DELETION:
				var oldNode = getPosDest(oldParent, oldType, patch.index);
				var sel = editor.utils.selectTr(tr, oldNode);
				removedItem = {
					node: sel.node,
					url: oldList[patch.index].url
				}
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

