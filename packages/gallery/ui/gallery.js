class HTMLElementGallery extends HTMLCustomElement {
	static get defaults() {
		return {
			mode: null
		};
	}

	get selectedMode() {
		return this.getAttribute('selected-mode');
	}
	set selectedMode(val) {
		this.setAttribute('selected-mode', val);
	}
	get activeGallery() {
		if (!this.selectedMode) return null;
		return Array.from(this.children).find((node) => {
			return node.getAttribute('block-type') == this.selectedMode;
		});
	}

	patch(state) {
		var mode = this.options.mode;
		Array.from(this.children).forEach((gal) => {
			var type = gal.getAttribute('block-type');
			if (!mode) mode = type;
			if (mode == type) this.selectedMode = mode;
		});
		var gal = this.activeGallery;
		if (gal.widget == null && gal.setup) Page.setup((state) => {
			gal.setup(state);	
		});
	}

	handleClick(e, state) {
		var item = e.target.closest('a');
		if (item) {
			if (item.dataset.mode != this.selectedMode) {
				state.push({query: {
					[`${this.id}.mode`]: item.dataset.mode
				}});
			}
			return;
		}
		item = e.target.closest('[block-type="portfolio_item"],[block-type="medialist_item"]');
		if (!item) return;
		if (item.matches('[block-type="medialist_item"]') && !e.target.closest('[block-content="media"]')) {
			// only allow click on medialist's media
			return;
		}
		var carousel = Array.from(this.children).find(function(gal) {
			return gal.getAttribute('block-type') == "carousel";
		});
		if (!carousel) return;
		var position = 0;
		while ((item=item.previousSibling)) position++;
		state.push({query: {
			[`${this.id}.mode`]: 'carousel',
			[`${carousel.id}.index`]: position
		}});
	}
}
HTMLCustomElement.define('element-gallery', HTMLElementGallery);
