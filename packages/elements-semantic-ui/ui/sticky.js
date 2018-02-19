class HTMLElementSticky extends HTMLCustomElement {
	setup() {
		if (!this.parentNode) return;
		if (this._sticky) this.destroy();
		this._sticky = HTMLElementSticky.manager.addInstance(this, {
			verticalPosition: this.dataset.position
		});
	}
	destroy() {
		if (!this._sticky) return;
		HTMLElementSticky.manager.removeInstance(this._sticky);
		delete this._sticky;
	}
	connectedCallback() {
		this.setup();
	}
	disconnectedCallback() {
		this.destroy();
	}
	update() {
		this.destroy();
		this.setup();
	}
}

Page.setup(function() {
	HTMLElementSticky.manager = stickybits({
		stickyClass: 'is-sticky',
		activeClass: 'is-sticky',
		parentClass: null,
		useStickyClasses: true
	});
	window.customElements.define('element-sticky', HTMLElementSticky);
});
