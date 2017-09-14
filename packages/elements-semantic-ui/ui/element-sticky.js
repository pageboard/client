class HTMLElementSticky extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.sticky = new StickyState(this);
	}
	disconnectedCallback() {
		if (this.sticky) {
			this.sticky.destroy();
			delete this.sticky;
		}
	}
}

Page.setup(function() {
	window.customElements.define('element-sticky', HTMLElementSticky);
});
