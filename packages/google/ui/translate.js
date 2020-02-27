class HTMLElementGoogleTranslate extends HTMLCustomElement {
	setup(state) {
		if (this.style) {
			Object.assign(document.body.style, this.style);
		}
		if (this.observer) this.close(state);
		this.observer = new MutationObserver((list) => {
			list.forEach((mut) => {
				if (mut.attributeName == "style") {
					var s = mut.target.style;
					var top = parseInt(s.top);
					this.shown = !isNaN(top) && top > 10;
					if (this.shown) {
						this.style = {
							minHeight: s.minHeight,
							top: s.top,
							position: s.position
						};
						this.started();
					} else if (top === 0) {
						delete this.style;
					}
					this.setClass();
				}
			});
		});
		this.observer.observe(document.body, {attributes: true});
		this.translate = Page.storage.getCookies().googtrans;
		if (this.translate) {
			this.show(state);
		}
	}
	show(state) {
		state.reconsent((agreed) => {
			if (!agreed || document.body.isContentEditable) return;
			if (window.google && window.google.translate) delete window.google.translate;
			this.id = `id${Date.now()}`;
			var cb = `HTMLElementGoogleTranslate_${this.id}`;
			window[cb] = this.cb.bind(this, state);
			var script = document.createElement('script');
			script.src = `https://translate.google.com/translate_a/element.js?cb=${cb}`;
			this.script = script;
			document.head.appendChild(script);
		});
	}
	setClass() {
		document.documentElement.classList.toggle('google-translate-shown', !!this.shown);
	}
	cb(state) {
		if (this.shown) return;
		this.script.remove();
		var TE = window.google.translate.TranslateElement;
		if (!this.inst) this.inst = new TE({
			pageLanguage: document.documentElement.lang,
			layout: TE.InlineLayout.SIMPLE,
			autoDisplay: true
		});
		this.inst.showBanner();
	}
	started() {
		if (this.translate) {
			this.translate = false; // once
			var frame = document.body.querySelector('.goog-te-banner-frame');
			var btn = frame.contentDocument.body.querySelector('[id=":0.confirm"]');
			if (btn) btn.dispatchEvent(new MouseEvent("click"));
		}
	}
	close() {
		if (this.observer) this.observer.disconnect();
		delete this.observer;
		if (this.inst) {
			this.inst.dispose();
			delete this.inst;
		}
	}
	handleClick(e, state) {
		e.stopPropagation();
		e.preventDefault();
		this.show(state);
		window.scrollTo({top: 0});
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-google-translate', HTMLElementGoogleTranslate);
});

