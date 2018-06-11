class HTMLElementGoogleTranslate extends HTMLCustomElement {
	connectedCallback() {
		var id = this.id || ("id" + Date.now());
		var cbName = `HTMLElementGoogleTranslate_${id}`;
		window[cbName] = this.update.bind(this);
		if (!this.id) {
			this.id = id;
			var script = this.ownerDocument.createElement('script');
			var me = this;
			if (this.dataset.opened == "true") {
				document.body.classList.add('google-translate-keep');
				script.onload = function() {
					function checkLoaded() {
						setTimeout(function() {
							var frame = document.querySelector('body > iframe.goog-te-menu-frame');
							if (frame) {
								me.open();
								if (frame.style.display != "none") return;
							}
							checkLoaded();
						}, 50);
					}
					checkLoaded();
				};
			} else {
				document.body.classList.remove('google-translate-keep');
			}
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
			pageLanguage: this.ownerDocument.documentElement.lang,
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
		this.open();
		if (this.dataset.opened == "true") return;
		var frame = document.querySelector('.goog-te-menu-frame');
		if (frame) frame.addEventListener('mouseout', this.blurFrame, false);
	}
	blurHandler(e) {
		if (this.dataset.opened == "true") return;
		this.blurFrame();
	}
	blurFrame() {
		var frame = document.querySelector('body > iframe.goog-te-menu-frame');
		if (frame) {
			frame.blur();
			frame.removeEventListener('mouseout', this.blurFrame, false);
		}
		this.classList.remove('active');
	}
	open() {
		this.classList.add('active');
		var it = this.querySelector('.goog-te-gadget-simple');
		if (it) it.click();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-google-translate', HTMLElementGoogleTranslate);
});

