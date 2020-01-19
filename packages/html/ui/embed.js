class HTMLElementEmbed extends HTMLCustomElement {
	static get defaults() {
		return {
			src: null,
			hash: null
		};
	}
	reveal(state) {
		this.classList.add('waiting');
		state.chain('consent', (state) => {
			this.classList.remove('waiting', 'denied');
			var opts = this.options;
			var src = opts.src;
			if (opts.hash) {
				var obj = Page.parse(src);
				obj.hash = opts.hash;
				src = Page.format(obj);
			}
			this.iframe = this.firstElementChild;
			if (state.scope.$consent == "no") {
				this.classList.add('denied');
				if (this.iframe) this.iframe.remove();
				return;
			}
			if (src == this.currentSrc) return;
			this.currentSrc = src;
			if (!this.iframe) {
				this.innerHTML = `<iframe width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; fullscreen; accelerometer; gyroscope"></iframe>`;
				this.iframe = this.firstElementChild;
				if (!this.iframe.allow) this.iframe.allowFullscreen = true;
			}
			this.classList.add('loading');
			this.iframe.setAttribute('src', src);
		});
	}
	captureClick() {
		if (this.matches('.denied') && Page.consent) Page.consent();
	}
	captureLoad() {
		this.classList.remove('loading');
	}
	captureError() {
		this.classList.add('error');
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
