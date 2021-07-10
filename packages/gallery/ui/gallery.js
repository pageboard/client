class HTMLElementGallery extends VirtualHTMLElement {
	static defaults = {
		mode: null
	};

	get selectedMode() {
		return this.getAttribute('selected-mode') || this.options.mode;
	}

	set selectedMode(str) {
		this.setAttribute('selected-mode', str);
	}

	patch(state) {
		var mode = this.options.mode;
		if (!mode) mode = this.children[0].getAttribute('block-type');
		this.selectedMode = mode;
	}

	paint() {
		/* needed for gallery-helper */
	}

	handleClick(e, state) {
		var item = e.target.closest('a');
		if (item) {
			if (item.dataset.mode != this.selectedMode) {
				state.push({query: Object.assign({
					[`${this.id}.mode`]: item.dataset.mode
				}, state.query)});
			}
			return;
		}
		item = e.target.closest('[block-type="portfolio_item"],[block-type="medialist_item"]');
		if (!item) return;
		if (item.matches('[block-type="medialist_item"]') && !e.target.closest('[block-content="media"]')) {
			// only allow click on medialist's media
			return;
		}
		var carousel = this.children.find(function(gal) {
			return gal.getAttribute('block-type') == "carousel";
		});
		if (!carousel) return;
		var position = 0;
		while ((item=item.previousSibling)) position++;
		state.push({query: Object.assign({
			[`${this.id}.mode`]: 'carousel',
			[`${carousel.id}.index`]: position
		}, state.query)});
	}
}

VirtualHTMLElement.define('element-gallery', HTMLElementGallery);
