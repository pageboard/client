class HTMLElementGallery extends Page.Element {
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
		const mode = this.options.mode || this.firstElementChild?.getAttribute('block-type');
		this.selectedMode = mode;
	}

	handleClick(e, state) {
		const anchor = e.target.closest('a');
		if (anchor) {
			if (anchor.dataset.mode != this.selectedMode) {
				state.push({
					query: {
						[`${this.id}.mode`]: anchor.dataset.mode,
						...state.query
					}
				});
			}
			return;
		}
		const item = e.target.closest('[block-type="portfolio_item"],[block-type="medialist_item"]');
		if (!item) return;
		if (item.matches('[block-type="medialist_item"]') && !e.target.closest('[block-content="media"]')) {
			// only allow click on medialist's media
			return;
		}
		const carousel = this.children.find(
			(gal) => gal.getAttribute('block-type') == "carousel"
		);
		if (!carousel) return;
		let position = 0;
		let cur = item;
		while ((cur = cur.previousSibling)) position++;
		state.push({
			query: {
				[`${this.id}.mode`]: 'carousel',
				[`${carousel.id}.index`]: position,
				...state.query
			}
		});
	}
}

Page.define('element-gallery', HTMLElementGallery);
