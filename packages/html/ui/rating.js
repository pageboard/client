class HTMLElementRating extends Page.Element {
	static defaults = {
		maximum: 4,
		value: (x) => parseFloat(x) || 0,
		char: '⭐'
	};

	patch(state) {
		const opts = this.options;
		while (this.children.length > opts.maximum) {
			this.firstElementChild.remove();
		}
		while (this.children.length < opts.maximum) {
			this.insertAdjacentHTML('beforeEnd', `<i class="icon" data-char="${opts.char}"></i>`);
		}
		this.children.forEach((item, i) => {
			item.dataset.char = opts.char;
			item.classList.toggle('active', i + 1 <= opts.value);
		});
	}
}

Page.define('element-rating', HTMLElementRating);

