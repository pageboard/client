class HTMLElementEmbed extends HTMLCustomElement {
	static get observedAttributes() {
		return ['src'];
	}
	patch(state) {
		var opts = state.options(this.id, ['hash']);
		var url = this.getAttribute('src') || '';
		if (opts.hash) {
			var obj = Page.parse(url);
			obj.hash = opts.hash;
			url = Page.format(obj);
		}
		this.iframe = this.firstElementChild;
		if (!this.iframe) {
			this.innerHTML = `<iframe src="${url}" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
			this.iframe = this.firstElementChild;
		} else {
			this.iframe.setAttribute('src', url);
		}
	}
	attributeChangedCallback(name, oldVal, newVal) {
		Page.patch(this);
	}
	close() {
		if (this.iframe) {
			this.iframe.remove();
			delete this.iframe;
		}
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-embed', HTMLElementEmbed);
});
