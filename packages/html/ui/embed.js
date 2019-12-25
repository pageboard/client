class HTMLElementEmbed extends HTMLCustomElement {
	static get defaults() {
		return {
			src: null,
			hash: null,
			loading: "lazy"
		};
	}
	reveal() {
		var opts = this.options;
		var src = opts.src;
		if (opts.hash) {
			var obj = Page.parse(src);
			obj.hash = opts.hash;
			src = Page.format(obj);
		}
		this.currentSrc = src;
		this.iframe = this.firstElementChild;
		if (!this.iframe) {
			this.innerHTML = `<iframe src="${src}" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen allow="autoplay; fullscreen"></iframe>`;
			this.iframe = this.firstElementChild;
		} else {
			this.iframe.setAttribute('src', src);
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
