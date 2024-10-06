class HTMLCustomConsentElement extends HTMLFormElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataTransient: false
	};

	static explicit;

	static ask(consent) {
		let tacit = true;
		const forms = document.querySelectorAll('[block-type="consent_form"]');
		this.explicit = forms.length > 0;
		for (const node of forms) {
			node.classList.add('visible');
			tacit = consent && !node.querySelector(`[name="${consent}"]`) || false;
		}
		return tacit ? "yes" : null;
	}
	setup(state) {
		if (this.isContentEditable) return;
		const view = this.ownView;
		view.textContent = '';
		const tmpl = this.ownTpl.prerender();
		view.appendChild(tmpl.content.cloneNode(true));
		state.chain('consent', this);
	}
	chainConsent(state) {
		window.HTMLCustomFormElement.prototype.fill.call(this, state.scope.storage.all());
		if (this.options.transient) this.classList.remove('visible');
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
		if (!HTMLCustomConsentElement.explicit) {
			state.runChain('consent');
		}
	});
});
