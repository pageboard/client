class HTMLElementEmbed extends HTMLCustomElement {
	static get defaults() {
		return {
			src: null,
			hash: null
		};
	}
	patch(state) {
		var opts = this.options;
		var url = opts.url;
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
