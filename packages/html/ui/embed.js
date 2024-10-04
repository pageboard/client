class HTMLElementEmbed extends VirtualHTMLElement {
	static consent = "embed";
	static defaults = {
		src: null,
		hash: null
	};
	static revealRatio = 0.2;
	init() {
		this.promise = Promise.resolve();
		this.promise.done = function() {};
	}
	reveal(state) {
		let done;
		this.promise = new Promise((resolve) => done = resolve);
		this.promise.done = done;
		this.classList.add('waiting');

		state.consent(this);
		return this.promise;
	}
	consent(state) {
		const consent = state.scope.$consent[this.constructor.consent];
		this.classList.toggle('denied', consent == "no");
		this.classList.toggle('waiting', consent == null);

		this.iframe = this.querySelector('iframe');
		if (consent != "yes") {
			if (this.iframe) this.iframe.remove();
			this.promise.done();
			return;
		}
		if (!this.iframe) {
			this.innerHTML = `<iframe width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; fullscreen; accelerometer; gyroscope"></iframe>`;
			this.iframe = this.firstElementChild;
		}
		if (!this.iframe.allow) this.iframe.allowFullscreen = true;

		const opts = this.options;
		const prev = Page.parse(this.currentSrc || this.iframe.src || "about:blank");
		const cur = Page.parse(opts.src || "about:blank");
		cur.hash = opts.hash;
		this.currentSrc = cur.toString();

		if (cur.samePath(prev) == false) {
			this.classList.remove('error');
			this.classList.add('loading');
			this.iframe.setAttribute('src', this.currentSrc);
		} else {
			if (cur.hash != prev.hash) {
				try {
					this.iframe.contentWindow.location.replace(this.currentSrc);
				} catch (err) {
					this.iframe.setAttribute('src', this.currentSrc);
				}
			}
			this.promise.done();
		}
	}
	captureClick(e, state) {
		if (this.matches('.denied')) state.reconsent(this);
	}
	captureLoad() {
		this.promise.done();
		this.classList.remove('loading');
	}
	captureError() {
		this.promise.done();
		this.classList.add('error');
	}
	handleAllMessage(e, state) {
		if (!e.origin || !this.options.src) return;
		if (this.options.src.startsWith(e.origin) == false) return;
		if (this.receiveMessage) this.receiveMessage(e.data ?? {});
	}
	close() {
		if (this.iframe) {
			this.iframe.remove();
			delete this.iframe;
		}
	}
}

Page.ready(() => {
	VirtualHTMLElement.define('element-embed', HTMLElementEmbed);
});
