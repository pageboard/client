Page.extend('element-gallery', class GalleryHelper {
	paint(state) {
		if (!state.scope.$write) return;
		if (!this.itemsObserver) this.itemsObserver = new MutationObserver(records => {
			setTimeout(() => {
				for (const record of records) this.mutate(record, state);
			}, 300);
		});
		else this.itemsObserver.disconnect();
		const mode = this.selectedMode;
		const gal = this.children.find(node => !mode || node.getAttribute('block-type') == mode);
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
		if (!state.scope.$write) return;
		const ed = window.parent.Pageboard.editor;
		if (!ed || ed.closed) return;
		const mode = this.selectedMode;
		const gals = Array.prototype.filter.call(this.children, (gal) => {
			return gal.getAttribute('block-type') != mode;
		});
		const target = record.target;
		if (target.matches('[block-content="items"]')) {
			for (const node of record.addedNodes) {
				if (node.nodeType != Node.ELEMENT_NODE) continue;
				const pos = target.children.indexOf(node);
				for (const gal of gals) {
					const items = gal.queryClosest('[block-content="items"]');
					const item = ed.render({
						type: `${gal.getAttribute('block-type')}_item`
					});
					item.querySelector('[block-content="media"]').appendChild(ed.render({
						type: 'image'
					}));
					items.insertBefore(item, items.children[pos]);
				}
			}
			Array.from(record.removedNodes).forEach((node, i) => {
				if (node.nodeType != Node.ELEMENT_NODE) return;
				const pos = target.childNodes.indexOf(record.previousSibling) + 1 + i;
				for (const gal of gals) {
					const items = gal.queryClosest('[block-content="items"]');
					const child = items.childNodes[pos];
					if (child) child.remove();
				}
			});
		} else if (target.matches('[block-type="image"]')) {
			if (record.type == "attributes" && record.attributeName != "url") return;
			const item = target.closest(`[block-type="${mode}_item"]`);
			if (!item) return;
			const pos = item.parentNode.children.indexOf(item);
			const block = ed.blocks.get(target);
			if (!block) {
				console.warn("Cannot synchronize without source block", record);
				return;
			}
			for (const gal of gals) {
				const items = gal.queryClosest('[block-content="items"]');
				const child = items.children[pos];
				if (!child) {
					console.warn("Cannot synchronize", gal, "at pos", pos);
					continue;
				}
				const image = child.querySelector('[block-type="image"]');
				if (!image) {
					console.warn("Cannot synchronize", gal, "with image at pos", pos);
					continue;
				}
				ed.blocks.mutate(image, {
					url: block.data?.url
				});
			}
		}
	}
});

