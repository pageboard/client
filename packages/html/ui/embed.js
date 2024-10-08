class HTMLElementEmbed extends Page.Element {
	static consent = "consent.embed";
	static defaults = {
		src: null,
		query: null,
		hash: null
	};
	static revealRatio = 0.2;

	reveal(state) {
		this.classList.add('waiting');
		state.consent(this);
	}
	get currentSrc() {
		return this.querySelector('iframe')?.getAttribute('src');
	}
	patch(state) {
		const { src } = this.options;
		if (!src) return;
		const { width, height, source } = state.scope.$hrefs?.[src] ?? {};
		if (source) this.dataset.source = source;
		if (width && height) this.style.paddingBottom = `calc(${height} / ${width} * 100%)`;
	}
	consent(state) {
		const consent = state.scope.storage.get(this.constructor.consent);
		this.classList.toggle('denied', consent == "no");
		this.classList.toggle('waiting', consent == null);

		const iframe = this.querySelector('iframe');
		if (consent != "yes") {
			iframe.src = "";
			return;
		}
		if (!iframe.allow) iframe.allowFullscreen = true;

		const opts = this.options;
		const prev = Page.parse(this.currentSrc);
		const cur = Page.parse(this.dataset.source || this.options.src || "about:blank");
		if (opts.query) {
			cur.query = Object.assign(cur.query, Page.parse(opts.query).query);
		}
		if (opts.hash) cur.hash = opts.hash;
		const curSrc = cur.toString();

		if (cur.samePath(prev) == false) {
			this.classList.remove('error');
			this.classList.add('loading');
			if (!state.scope.$write) {
				iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
			}
			iframe.src = curSrc;
		} else if (cur.hash != prev.hash) {
			try {
				iframe.contentWindow.location.replace(curSrc);
			} catch (err) {
				iframe.src = curSrc;
			}
		}
	}
	captureClick(e, state) {
		if (this.matches('.denied')) {
			state.consent(this, true);
		}
	}
	captureLoad() {
		this.classList.remove('loading');
	}
	captureError() {
		this.classList.add('error');
	}
	handleAllMessage(e, state) {
		if (!e.origin || !this.currentSrc) return;
		if (this.currentSrc?.startsWith(e.origin) == false) return;
		if (this.receiveMessage) this.receiveMessage(e.data ?? {});
	}
	close() {
		const iframe = this.querySelector('iframe');
		if (iframe) iframe.src = "";
	}
}


Page.define('element-embed', HTMLElementEmbed);

