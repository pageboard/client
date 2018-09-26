/* global stickybits */
class HTMLElementSticky extends HTMLCustomElement {
	static init() {
		this.manager = stickybits({
			stickyClass: 'is-sticky',
			activeClass: 'is-sticky',
			parentClass: null,
			useStickyClasses: true
		});
	}
	setup() {
		if (!this.parentNode) return;
		if (this._sticky) this.destroy();
		this._sticky = this.constructor.manager.addInstance(this, {
			verticalPosition: this.dataset.position
		});
	}
	destroy() {
		if (!this._sticky) return;
		this.constructor.manager.removeInstance(this._sticky);
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
	HTMLCustomElement.define('element-sticky', HTMLElementSticky);
});
