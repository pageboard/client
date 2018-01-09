class HTMLElementEmbed extends HTMLCustomElement {
	connectedCallback() {
		if (!this.iframe) {
			this.iframe = this.dom`<iframe src="${this.dataset.url}" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
			this.appendChild(this.iframe);
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
	window.customElements.define('element-embed', HTMLElementEmbed);
});
