HTMLElementGallery.prototype._init = function() {
	var listener = this._switchListener.bind(this);
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
	var cache = {};
	var bmg = this._editor.blocks;
	Array.prototype.forEach.call(this._selectMedias(node), function(image) {
		var block = bmg.get(image.getAttribute('block-id'));
		cache[block.id] = block.data.url;
	});
	this._cache = cache;
};

HTMLElementGallery.prototype._initHelper = function() {
	this._syncAfter = window.parent.Pageboard.Debounce(this._sync, 200);

	this.menuObserver = new MutationObserver(function(mutations) {
		this._setup();
		this._syncAfter();
	}.bind(this));

	this.itemsObserver = new MutationObserver(function(mutations) {
		// we NEED to use href as key
		var doSync = false;
		var sel = '[block-content="items"],[block-type="image"]';
		if (mutations.some(function(rec) {
			return rec.type == "childList" && rec.target.matches(sel);
		})) this._syncAfter();
	}.bind(this));
};

HTMLElementGallery.prototype._selectMedias = function(gal) {
	return gal.querySelectorAll('[block-content="media"] > [block-type="image"]');
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

HTMLElementGallery.prototype._sync = function() {
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
};

