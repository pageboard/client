class HTMLElementEmbed extends HTMLCustomElement {
	static get observedAttributes() {
		return ['src'];
	}
	setup() {
		var src = this.getAttribute('src');
		if (!this.iframe) {
			this.innerHTML = `<iframe src="${src}" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
			this.iframe = this.firstElementChild;
		} else {
			this.iframe.setAttribute('src', src);
		}
	}
	attributeChangedCallback(name, oldVal, newVal) {
		Page.setup(this);
	}
	close() {
		if (this.iframe) {
			this.iframe.remove();
			delete this.iframe;
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-embed', HTMLElementEmbed);
});
