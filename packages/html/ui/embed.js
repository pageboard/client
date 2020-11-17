class HTMLElementEmbed extends HTMLCustomElement {
	static get defaults() {
		return {
			src: null,
			hash: null
		};
	}
	init() {
		this.promise = Promise.resolve();
		this.promise.done = function() {};
	}
	reveal(state) {
		var done;
		this.promise = new Promise(function(resolve) {
			done = resolve;
		});
		this.promise.done = done;
		this.classList.add('waiting');

		state.consent(this);
		return this.promise;
	}
	consent(state) {
		var agreed = state.scope.$consent == "yes";
		this.classList.remove('waiting', 'denied');
		var opts = this.options;
		var src = opts.src;
		if (opts.hash) {
			var obj = Page.parse(src);
			obj.hash = opts.hash;
			src = Page.format(obj);
		}
		this.iframe = this.firstElementChild;
		if (!agreed) {
			this.classList.add('denied');
			if (this.iframe) this.iframe.remove();
			this.promise.done();
			return;
		}
		if (src != this.currentSrc) {
			this.classList.remove('error');
			this.currentSrc = src;
			if (!this.iframe) {
				this.innerHTML = `<iframe width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; fullscreen; accelerometer; gyroscope"></iframe>`;
				this.iframe = this.firstElementChild;
				if (!this.iframe.allow) this.iframe.allowFullscreen = true;
			}
			this.classList.add('loading');

			this.iframe.setAttribute('src', src);
		} else {
			this.promise.done();
		}
	}
	captureClick(e, state) {
		if (this.matches('.denied')) state.reconsent();
	}
	captureLoad() {
		this.promise.done();
		this.classList.remove('loading');
	}
	captureError() {
		this.promise.done();
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
