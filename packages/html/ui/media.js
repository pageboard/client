class HTMLElementMedia {
	#defer;

	init() {
		this.#defer = new Deferred();
	}
	patch(state) {
		this.classList.remove('error', 'loading');
		const loc = Page.parse(this.options.src);
		const meta = state.scope.$hrefs?.[loc.pathname] ?? {};
		if (!meta || !meta.width || !meta.height) return;
		this.width = meta.width;
		this.height = meta.height;
	}
	reveal(state) {
		const curSrc = this.options.src;
		if (curSrc != this.currentSrc) {
			try {
				this.currentSrc = curSrc;
			} catch(e) {
				// pass
			}
			this.setAttribute('src', curSrc);
		}
		if (this.isContentEditable) this.pause();
		return this.#defer;
	}
	handleClick(e) {
		if (this.isContentEditable) e.preventDefault();
	}
	captureLoad() {
		this.#defer.resolve();
		this.classList.remove('loading');
	}
	captureError() {
		this.#defer.resolve();
		this.classList.remove('loading');
		this.classList.add('error');
	}
}

class HTMLElementVideo extends HTMLVideoElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataSrc: null
	};
}
VirtualHTMLElement.inherits(HTMLElementVideo, HTMLElementMedia);
VirtualHTMLElement.define('element-video', HTMLElementVideo, 'video');

class HTMLElementAudio extends HTMLAudioElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataSrc: null
	};
}
VirtualHTMLElement.inherits(HTMLElementAudio, HTMLElementMedia);
VirtualHTMLElement.define('element-audio', HTMLElementAudio, 'audio');
