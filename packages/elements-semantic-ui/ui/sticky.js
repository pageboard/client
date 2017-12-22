class HTMLElementSticky extends HTMLElement {
	constructor() {
		super();
	}
	setup() {
		HTMLElementSticky.manager.add(this, {
			verticalPosition: this.dataset.position
		});
	}
	destroy() {
		HTMLElementSticky.manager.remove(this);
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
