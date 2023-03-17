class HTMLElementEmbed extends Page.Element {
	static defaults = {
		url: null,
		query: null,
		hash: null
	};
	static revealRatio = 0.2;

	reveal(state) {
		this.classList.add('waiting');
		state.consent(this);
	}
	get currentSrc() {
		return this.querySelector('iframe')?.src ?? "about:blank";
	}
	patch(state) {
		const meta = state.scope.$hrefs?.[this.options.url];
		if (meta) {
			this.title = meta.title;
			if (meta.source) this.setAttribute('data-src', meta.source);
			this.style.paddingBottom = `calc(${meta.height} / ${meta.width} * 100%)`;
		} else {
			console.warn("Missing href", this.options.url);
		}
	}
	consent(state) {
		const consent = state.scope.$consent;
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
		const cur = Page.parse(this.dataset.src || this.options.url || "about:blank");
		cur.hash = opts.hash;
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
		if (this.matches('.denied')) state.reconsent();
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

