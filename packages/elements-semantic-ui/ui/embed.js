class HTMLElementEmbed extends HTMLCustomElement {
	static get observedAttributes() {
		return ['src'];
	}
	connectedCallback() {
		if (!this.iframe) {
			this.innerHTML = `<iframe src="${this.getAttribute('src')}" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
			this.iframe = this.firstElementChild;
		}
	}
	attributeChangedCallback(name, oldVal, newVal) {
		this.update();
	}
	update() {
		if (this.iframe) this.iframe.setAttribute('src', this.getAttribute('src'));
	}
	disconnectedCallback() {
		if (this.iframe) {
			this.iframe.remove();
			delete this.iframe;
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-embed', HTMLElementEmbed);
});
