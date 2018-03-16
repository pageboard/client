class HTMLElementEmbed extends HTMLCustomElement {
	connectedCallback() {
		if (!this.iframe) {
			this.innerHTML = `<iframe src="${this.dataset.url}" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
			this.iframe = this.firstChild;
		}
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
