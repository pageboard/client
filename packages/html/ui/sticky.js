class HTMLElementStickyNav extends Page.Element {
	#lastScroll;
	#currentScroll() {
		return document.documentElement.scrollTop;
	}
	listener() {
		if (this.raf) window.cancelAnimationFrame(this.raf);
		this.raf = window.requestAnimationFrame(() => {
			this.layout();
		});
	}
	handleAllScroll(e, state) {
		this.listener();
	}
	setup() {
		this.dataset.mode = "start";
		this.#lastScroll = this.#currentScroll();
		this.listener();
	}
	layout() {
		const val = this.#currentScroll();
		let mode;
		if (val == 0) mode = "start";
		else if (this.#lastScroll < val) mode = "down";
		else mode = "up";

		this.#lastScroll = val;
		this.dataset.mode = mode;
	}
}

Page.define('element-sticky-nav', HTMLElementStickyNav, 'header');
