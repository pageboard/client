class HTMLElementGoogleTranslate extends VirtualHTMLElement {
	setup(state) {
		if (this.style) {
			Object.assign(document.body.style, this.style);
		}
		if (this.observer) this.close(state);
		this.observer = new MutationObserver((list) => {
			list.forEach((mut) => {
				if (mut.attributeName == "style") {
					const s = mut.target.style;
					const top = parseInt(s.top);
					this.shown = !Number.isNaN(top) && top > 10;
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
	}
	paint(state) {
		this.translate = Page.storage.getCookies().googtrans;
		if (this.translate) {
			state.consent(this);
		}
	}
	consent(state) {
		const agreed = state.scope.$consent == "yes";
		if (!agreed || document.body.isContentEditable) return;
		if (window.google && window.google.translate) delete window.google.translate;
		this.id = `id${Date.now()}`;
		const cb = `HTMLElementGoogleTranslate_${this.id}`;
		window[cb] = this.cb.bind(this, state);
		const script = document.createElement('script');
		script.src = `https://translate.google.com/translate_a/element.js?cb=${cb}`;
		this.script = script;
		document.head.appendChild(script);
	}
	setClass() {
		document.documentElement.classList.toggle('google-translate-shown', Boolean(this.shown));
	}
	cb(state) {
		if (this.shown) return;
		this.script.remove();
		const TE = window.google.translate.TranslateElement;
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
			const frame = document.body.querySelector('.goog-te-banner-frame');
			const btn = frame.contentDocument.body.querySelector('[id=":0.confirm"]');
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
		state.reconsent(this);
		window.scrollTo({top: 0});
	}
}

Page.setup(function() {
	VirtualHTMLElement.define('element-google-translate', HTMLElementGoogleTranslate);
});

