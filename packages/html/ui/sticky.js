class HTMLElementSticky extends HTMLCustomElement {
	static init() {
		this.stickyfill = window.Stickyfill;
		this.stickyfill.forceSticky();
	}
	init() {
		var listener = this.listener.bind(this);
		var raf;
		this.listener = function() {
			window.cancelAnimationFrame(raf);
			raf = window.requestAnimationFrame(listener);
		};
	}
	handleAllScroll(e, state) {
		this.listener();
	}
	handleAllResize(e, state) {
		this.listener();
	}
	setup() {
		this.dataset.mode = "start";
		if (this._sticky || !this.parentNode) return;
		// some stylesheets might target :not([data-mode="start"]) so it must be the initial value
		this._sticky = this.constructor.stickyfill.addOne(this);
		this.listener();
	}
	listener(e) {
		if (!this._sticky) return;
		var mode = this._sticky._stickyMode || 'start';
		if (this.dataset.mode != mode) {
			this.dataset.mode = mode;
			this._sticky._recalcClone();
		}
	}
	close() {
		if (!this._sticky) return;
		delete this._sticky;
		this.constructor.stickyfill.removeOne(this);
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-sticky', HTMLElementSticky);
});
