class HTMLCustomConsentElement extends HTMLFormElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataTransient: false
	};

	static explicits = new Set();

	static ask(consent) {
		let tacit = true;
		const forms = document.querySelectorAll('[block-type="consent_form"]');
		const consents = Page.storage.all();
		for (const node of forms) {
			window.HTMLCustomFormElement.prototype.fill.call(node, consents);
			node.classList.add('visible');
			tacit = consent && !node.querySelector(`[name="${consent}"]`) || false;
		}
		if (!tacit) this.explicits.add(consent);
		return tacit ? "yes" : null;
	}
	setup(state) {
		if (this.isContentEditable) return;
		this.constructor.explicits = new Set();
		const view = this.ownView;
		view.textContent = '';
		const tmpl = this.ownTpl.prerender();
		view.appendChild(tmpl.content.cloneNode(true));
		state.chain('consent', this);
	}
	chainConsent(state) {
		if (this.options.transient) {
			this.classList.remove('visible');
		} else {
			window.HTMLCustomFormElement.prototype.fill.call(this, Page.storage.all());
		}
	}
	handleChange(e, state) {
		if (e.type == "submit" || !this.elements.find(item => item.type == "submit")) {
			this.handleSubmit(e, state);
		}
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		const consents = window.HTMLCustomFormElement.prototype.read.call(this);
		const names = new Set();
		for (const node of this.elements) {
			if (node.name?.startsWith('consent.')) names.push(node.name);
		}
		const def = consents.consent;
		if (def != "custom") for (const consent of names) {
			consents[consent] = def;
		}
		if (Array.from(names).some(c => consents[c] == null)) {
			// not all consents have been answered
			return;
		}
		for (const [key, val] of Object.entries(consents)) {
			Page.storage.set(key, val);
		}
		state.runChain('consent');
	}
	patch(state) {
		if (this.isContentEditable) return;
		this.ownTpl.prerender();
	}
	get ownTpl() {
		return this.children.find(
			node => node.matches('template,script[type="text/html"]')
		);
	}
	get ownView() {
		return this.children.find(node => node.matches('.view'));
	}
}

Page.State.prototype.consent = function (listener, ask) {
	const { consent } = listener.constructor;
	if (!consent) {
		console.warn("Expected a static consent field", listener);
		return;
	}
	const cur = Page.storage.get(consent);
	if (cur == null || ask) {
		Page.storage.set(consent, HTMLCustomConsentElement.ask(consent));
	}
	this.chain('consent', listener);
};

Page.ready(() => {
	VirtualHTMLElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
});

Page.paint(state => {
	state.finish(() => {
		if (!HTMLCustomConsentElement.explicits.size) {
			state.runChain('consent');
		}
	});
});
