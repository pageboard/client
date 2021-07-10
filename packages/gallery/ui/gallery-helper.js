VirtualHTMLElement.extend('element-gallery', class GalleryHelper {
	paint(state) {
		if (!state.scope.$write) return;
		if (!this.itemsObserver) this.itemsObserver = new MutationObserver((records) => {
			setTimeout(() => {
				records.forEach((record) => this.mutate(record, state));
			}, 300);
		});
		this.itemsObserver.disconnect();
		const mode = this.selectedMode;
		const gal = this.children.find((node) => !mode || node.getAttribute('block-type') == mode);
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
		const ed = window.parent.Pageboard.editor;
		if (!ed || ed.closed) return;
		const mode = this.selectedMode;
		const gals = Array.prototype.filter.call(this.children, (gal) => {
			return gal.getAttribute('block-type') != mode;
		});
		const target = record.target;
		if (target.matches('[block-content="items"]')) {
			Array.from(record.addedNodes).forEach(function(node) {
				if (node.nodeType != Node.ELEMENT_NODE) return;
				const pos = target.children.indexOf(node);
				gals.forEach((gal) => {
					const items = gal.queryClosest('[block-content="items"]');
					const item = ed.render({
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
				const pos = target.childNodes.indexOf(record.previousSibling) + 1 + i;
				gals.forEach((gal) => {
					const items = gal.queryClosest('[block-content="items"]');
					const child = items.childNodes[pos];
					if (child) child.remove();
				});
			});
			return;
		}
		if (target.matches('[block-type="image"]')) {
			if (record.type == "attributes" && record.attributeName != "url") return;
			const item = target.closest(`[block-type="${mode}_item"]`);
			if (!item) return;
			const pos = item.parentNode.children.indexOf(item);
			const block = ed.blocks.get(target);
			if (!block) {
				console.warn("Cannot synchronize without source block", record);
				return;
			}
			gals.forEach((gal) => {
				const items = gal.queryClosest('[block-content="items"]');
				const child = items.children[pos];
				if (!child) {
					console.warn("Cannot synchronize", gal, "at pos", pos);
					return;
				}
				const image = child.querySelector('[block-type="image"]');
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

