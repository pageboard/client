const HTMLElementMediaConstructor = Superclass => class extends Superclass {
	#defer = new Deferred();

	patch(state) {
		this.classList.remove('error', 'loading');
	}
	reveal(state) {
		const curSrc = this.options.src;
		if (curSrc != this.currentSrc) {
			try {
				this.currentSrc = curSrc;
			} catch (e) {
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
};

class HTMLElementVideo extends HTMLElementMediaConstructor(Page.create(HTMLVideoElement)) {
	static defaults = {
		dataSrc: null
	};
}
Page.define('element-video', HTMLElementVideo, 'video');

class HTMLElementAudio extends HTMLElementMediaConstructor(Page.create(HTMLAudioElement)) {
	static defaults = {
		dataSrc: null
	};
}
Page.define('element-audio', HTMLElementAudio, 'audio');
