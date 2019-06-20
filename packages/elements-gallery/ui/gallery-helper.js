Page.ready(function(state) {
	var it = window.parent.Pageboard;
	if (!state.scope.$write) {
		return;
	}
	HTMLCustomElement.extends('element-gallery', class GalleryHelper {
		patch(state) {
			Page.setup((state) => {
				this.setup(state);
			});
		}
		setup(state) {
			if (!this.itemsObserver) this.itemsObserver = new MutationObserver((records) => {
				setTimeout(() => {
					records.forEach((record) => this.mutate(record, state));
				}, 300);
			});
			this.itemsObserver.disconnect();
			var gal = this.activeGallery;
			if (!gal) return;
			this.itemsObserver.observe(gal, {
				childList: true,
				subtree: true,
				attributes: true
			});
		}
		close(state) {
			if (this.itemsObserver) {
				this.itemsObserver.disconnect();
				delete this.itemsObserver;
			}
		}
		mutate(record, state) {
			var ed = window.parent.Pageboard.editor;
			if (!ed || ed.closed) return;
			var mode = this.selectedMode;
			var gals = Array.prototype.filter.call(this.children, (gal) => {
				return gal.getAttribute('block-type') != mode;
			});
			var target = record.target;
			if (target.matches('[block-content="items"]')) {
				Array.from(record.addedNodes).forEach(function(node) {
					if (node.nodeType != Node.ELEMENT_NODE) return;
					var pos = target.children.indexOf(node);
					gals.forEach((gal) => {
						var items = gal.querySelector('[block-content="items"]');
						var item = ed.render({
							type: `${gal.getAttribute('block-type')}_item`
						});
						item.querySelector('[block-content="media"]').appendChild(ed.render({
							type: 'image'
						}));
						items.insertBefore(item, items.children[pos]);
					});
				});
				Array.from(record.removedNodes).forEach(function(node, i) {
					if (node.nodeType != Node.ELEMENT_NODE) return;
					var pos = target.childNodes.indexOf(record.previousSibling) + 1 + i;
					gals.forEach((gal) => {
						var items = gal.querySelector('[block-content="items"]');
						var child = items.childNodes[pos];
						if (child) child.remove();
					});
				});
				return;
			}
			if (target.matches('[block-type="image"]')) {
				if (record.type == "attributes" && record.attributeName != "url") return;
				var item = target.closest(`[block-type="${mode}_item"]`);
				if (!item) return;
				var pos = item.parentNode.children.indexOf(item);
				var block = ed.blocks.get(target);
				if (!block) {
					console.warn("Cannot synchronize without source block", record);
					return;
				}
				gals.forEach((gal) => {
					var items = gal.querySelector('[block-content="items"]');
					var child = items.children[pos];
					if (!child) {
						console.warn("Cannot synchronize", gal, "at pos", pos);
						return;
					}
					var image = child.querySelector('[block-type="image"]');
					if (!image) {
						console.warn("Cannot synchronize", gal, "with image at pos", pos);
						return;
					}
					ed.blocks.mutate(image, {
						url: (block.data || {}).url
					});
				});
			}
		}
	});
});
