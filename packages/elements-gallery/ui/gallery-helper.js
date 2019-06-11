Page.ready(function(state) {
	var it = window.parent.Pageboard;
	if (!state.scope.$write) {
		return;
	}
	var Diff = window.listDiff;
	function getPosDest(parent, blockType, pos) {
		var list = parent.querySelectorAll(`[block-type="${blockType}_item"]`);
		if (list.length > pos) return list.item(pos);
	}
	HTMLCustomElement.intercept(window.customElements.get('element-gallery'), {
		patch: function(state) {
			Page.setup((state) => {
				this.setup(state);
			});
		},
		setup: function(state) {
			this.create();
			this.syncGallery();
		},
		create() {
			if (!this._syncAfter) {
				this._syncAfter = it.debounce(this._sync, 200);
			}
			if (!this.itemsObserver) this.itemsObserver = new MutationObserver((mutations) => {
				// we NEED to use href as key
				var type = this.selectedMode;
				var sel = '[block-content="items"],[block-type="image"]';
				if (mutations.some(function(rec) {
					var cand = rec.type == "attributes" && rec.target.matches('element-image');
					if (!cand) cand = rec.type == "childList" && rec.target.matches(sel);
					if (cand && rec.target.closest(`[block-type="${type}"]`)) return true;
				})) {
					this._syncAfter();
				}
			});
		},
		destroy() {
			if (this.itemsObserver) {
				this.itemsObserver.disconnect();
				delete this.itemsObserver;
			}
		},
		close: function(state) {
			this.destroy();
		},
		syncGallery: function() {
			this.itemsObserver.disconnect();
			var gal = this.activeGallery;
			if (!gal) return;
			this.itemsObserver.observe(gal, {
				childList: true,
				subtree: true,
				attributes: true
			});
		},
		_selectMedias: function(gal) {
			return Array.from(gal.querySelectorAll('[block-content="media"] > [block-type="image"]'))
			.map(function(node, i) {
				var block = it.editor.blocks.get(node.getAttribute('block-id'));
				return {
					pos: i,
					block: block,
					url: (block.data || {}).url || ""
				};
			});
		},
		_sync: function() {
			if (this._syncing || !this.selectedMode || !it.editor || it.editor.closed) return;
			this._syncing = true;
			var selItems = '[block-content="items"]';
			var selMode = this.selectedMode;
			var curList = this._selectMedias(this.activeGallery);
			var blocks = it.editor.blocks;
			var utils = it.editor.utils;

			Array.from(this.children).forEach(function(gal) {
				var oldType = gal.getAttribute('block-type');
				if (oldType == selMode) return;
				var oldList = this._selectMedias(gal);
				var oldParent = gal.matches(selItems) ? gal : gal.querySelector(selItems);
				if (!oldParent) return;
				// a move is: remove + create of the same url
				var removedItem;
				var tr = it.editor.state.tr;
				var patches = Diff(oldList, curList, "url");
				var sel, oldBlock, oldNode, curBlock;
				patches.forEach(function(patch) {
					switch (patch.type) {
					case Diff.INSERTION:
						// move selection to position
						var atEnd = patch.index == oldList.length;
						var toNode = getPosDest(oldParent, oldType, atEnd ? patch.index - 1 : patch.index);
						sel = utils.selectTr(tr, toNode, true);
						var pos = atEnd ? sel.to + 1 : sel.from - 1;
						var $pos = tr.doc.resolve(pos);
						var node;
						if (removedItem && patch.item.url == removedItem.url) {
							node = removedItem.node;
						} else {
							var block = blocks.create(`${oldType}_item`);
							blocks.set(block);
							var dom = it.editor.render(block);
							curBlock = patch.item && patch.item.block;
							if (curBlock) {
								oldBlock = blocks.copy(curBlock);
								delete oldBlock.id;
								blocks.set(oldBlock);
								dom.querySelector('[block-content="media"]').appendChild(it.editor.render(oldBlock));
							}
							node = utils.fill(utils.parseTr(tr, dom, $pos).content.firstChild);
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
							utils.refreshTr(tr, oldNode, oldBlock);
						}
						break;
					case Diff.DELETION:
						oldNode = getPosDest(oldParent, oldType, patch.index);
						sel = utils.selectTr(tr, oldNode);
						removedItem = {
							node: sel.node,
							url: oldList[patch.index].url
						};
						utils.deleteTr(tr, sel);
						break;
					}

				});
				if (patches.length) {
					it.editor.dispatch(tr);
				}
			}, this);

			this._syncing = false;
		}
	});
});
