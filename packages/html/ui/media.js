const HTMLElementMediaConstructor = Superclass => class extends Superclass {

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
		if (state.scope.$write) this.pause();
	}
	handleClick(e, state) {
		if (state.scope.$write) e.preventDefault();
	}
	captureLoad() {
		this.classList.remove('loading');
	}
	captureError() {
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
