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
	var dstList = this._selectMedias(gallery);
	var editor = this._editor;

	this._galleries.forEach(function(gal) {
		if (gal == gallery) return;
		var blockType = gal.getAttribute('block-type');
		var srcList = this._selectMedias(gal)
		var srcParent = gal.matches(selItems) ? gal : gal.querySelector(selItems);
		if (!srcParent) return;
		// a move is: remove + create of the same url
		var removedItem;
		listDiff(srcList, dstList, "url").forEach(function(patch) {
			var src = srcList[patch.index];
			var dest = patch.item;
			var destBlock = dest && dest.block;
			var srcBlock = src && src.block;
			switch (patch.type) {
			case listDiff.INSERTION:
				// move selection to position
				var toNode = getPosDest(srcParent, blockType, patch.index);
				var tr = editor.state.tr;
				var sel;
				if (removedItem && patch.item.url == removedItem.url) {
					sel = editor.utils.selectTr(tr, toNode, true);
					tr.insert(sel.from - 1, removedItem.node);
				} else {
					toNode = srcParent.insertBefore(document.createTextNode(""), toNode);
					sel = editor.utils.selectTr(tr, toNode, true);
					var rootBlock = editor.blocks.create(`${blockType}_item`);
					editor.blocks.set(rootBlock);
					editor.utils.insertTr(tr, rootBlock, sel);
				}
				editor.dispatch(tr);
				removedItem = null;
				break;
			case listDiff.SUBSTITUTION:
				if (srcBlock.data.url != destBlock.data.url) {
					srcBlock.data.url = destBlock.data.url;
					var toNode = getPosDest(srcParent, blockType, patch.index).querySelector('[block-type="image"]');
					editor.utils.refresh(toNode, destBlock);
				}
				break;
			case listDiff.DELETION:
				var destRoot = getPosDest(srcParent, blockType, patch.index);
				var sel = editor.utils.select(destRoot);
				removedItem = {
					node: sel.node,
					url: src.url
				}
				editor.utils.delete(sel);
				break;
			}
		});
	}, this);

	this._syncing = false;
};

