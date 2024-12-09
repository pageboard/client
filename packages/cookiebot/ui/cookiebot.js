Page.connect(new class {
	#cla;

	setup(state) {
		if (!window.Cookiebot) return;
		const cla = this.#cla = window.customElements.get("element-consent");
		cla.ask = function (state, name) {
			cla.explicits.add(name);
			window.Cookiebot.show();
			window.Cookiebot.renew();
		};
		window.addEventListener('CookiebotOnConsentReady', this);
	}
	paint(state) {
		if (state.referrer && !state.samePathname(state.referrer)) {
			window.Cookiebot.widget = null;
			window.Cookiebot.initWidget();
		}
	}
	close() {
		window.removeEventListener('CookiebotOnConsentReady', this);
	}
	handleEvent(e) {
		const { consent } = window.Cookiebot;

		if (consent.method == "explicit") for (const name of this.#cla.explicits) {
			Page.consents(name, consent[name]);
		}
		Page.copy().runChain('consent');
	}
});

class HTMLElementCookiebotDeclaration extends Page.create(HTMLDivElement) {
	paint(state) {
		if (this.parentNode.isContentEditable || this.querySelector('script')) return;
		this.textContent = '';
		const node = document.createElement('script');
		node.src = this.dataset.src;
		node.dataset.culture = state.scope.$lang;
		this.appendChild(node);
	}
}

Page.define('element-cookiebot-declaration', HTMLElementCookiebotDeclaration, "div");

