class HTMLElementAudio extends HTMLAudioElement {
	handleClick(e) {
		if (this.isContentEditable) e.preventDefault();
	}
	setup(state) {
		if (this.isContentEditable) this.pause();
	}
}

HTMLCustomElement.define('element-audio', HTMLElementAudio, 'audio');

