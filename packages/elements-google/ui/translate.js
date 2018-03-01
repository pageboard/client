class HTMLElementGoogleTranslate extends HTMLCustomElement {
	init() {
		this.overHandler = this.overHandler.bind(this);
		this.focusHandler = this.focusHandler.bind(this);
		this.blurHandler = this.blurHandler.bind(this);
		this.blurFrame = this.blurFrame.bind(this);
	}
	connectedCallback() {
		var id = this.id || ("id" + Date.now());
		var cbName = `HTMLElementGoogleTranslate_${id}`;
		window[cbName] = this.update.bind(this);
		if (!this._id) {
			this.id = id;
			var script = this.ownerDocument.createElement('script');
			script.src = `https://translate.google.com/translate_a/element.js?cb=${cbName}`;
			this.ownerDocument.head.appendChild(script);
		}
		this.addEventListener('mouseover', this.overHandler, false);
		this.addEventListener('focus', this.focusHandler, false);
		this.addEventListener('blur', this.blurHandler, false);
	}
	update() {
		if (document.body.contentEditable == "true") {
			return;
		}
		if (this._translateElement) {
			return;
		}
		var TE = google.translate.TranslateElement;
		this._translateElement = new TE({
			pageLanguage: this.dataset.lang || this.ownerDocument.documentElement.lang,
			layout: TE.InlineLayout.SIMPLE,
			autoDisplay: this.dataset.banner == "true"
		}, this.id);
	}
	disconnectedCallback() {
		this.removeEventListener('mouseover', this.overHandler, false);
		this.removeEventListener('focus', this.focusHandler, false);
		this.removeEventListener('blur', this.blurHandler, false);
	}
	overHandler(e) {
		this.focusHandler(e);
	}
	focusHandler(e) {
		this.classList.add('active');
		var it = this.querySelector('.goog-te-gadget-simple');
		if (it) it.click();
		var frame = document.querySelector('.goog-te-menu-frame');
		if (frame) frame.addEventListener('mouseout', this.blurFrame, false);
	}
	blurHandler(e) {
		this.blurFrame();
	}
	blurFrame() {
		var frame = document.querySelector('.goog-te-menu-frame');
		if (frame) {
			frame.blur();
			frame.removeEventListener('mouseout', this.blurFrame, false);
		}
		this.classList.remove('active');
	}
}

HTMLCustomElement.define('element-google-translate', HTMLElementGoogleTranslate);

