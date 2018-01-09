class HTMLElementImage extends HTMLCustomElement {
	connectedCallback() {
		if (objectFitImages.supportsObjectFit) return;
		var style = "";
		if (this.dataset.fit) {
			style += `object-fit: ${this.dataset.fit};`;
		}
		if (this.dataset.position) {
			style += `object-position: ${this.dataset.position};`;
		}
		if (style.length) {
			this.style.fontFamily = `'${style}'`;
			objectFitImages(this);
		}
	}
}

Page.setup(function() {
	window.customElements.define('element-image', HTMLElementImage);
});
