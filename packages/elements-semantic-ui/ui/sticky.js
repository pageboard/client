class HTMLElementSticky extends HTMLCustomElement {
	static init() {
		this.stickyfill = window.Stickyfill;
		this.stickyfill.forceSticky();
	}
	static destroy() {
		this.stickyfill.destroy();
	}
	init() {
		var listener = this.listener.bind(this);
		var raf;
		this.listener = function() {
			window.cancelAnimationFrame(raf);
			raf = window.requestAnimationFrame(listener);
		};
	}
	setup() {
		this.dataset.mode = "start";
		if (this._sticky || !this.parentNode) return;
		window.addEventListener('scroll', this.listener);
		window.addEventListener('resize', this.listener);
		// some stylesheets might target :not([data-mode="start"]) so it must be the initial value
		this._sticky = this.constructor.stickyfill.addOne(this);
		this.listener();
	}
	listener(e) {
		if (!this._sticky) return;
		var mode = this._sticky._stickyMode;
		if (this.dataset.mode == mode) return;
		this.dataset.mode = mode;
	}
	close() {
		if (!this._sticky || !this.parentNode) return;
		delete this._sticky;
		window.removeEventListener('scroll', this.listener);
		window.removeEventListener('resize', this.listener);
		this.constructor.stickyfill.removeOne(this);
	}
	update() {
		if (this._sticky) this._sticky.refresh();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-sticky', HTMLElementSticky);
});

Page.close(function() {
	HTMLElementSticky.destroy();
});
