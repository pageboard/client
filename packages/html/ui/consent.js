class HTMLElementConsent extends Page.create(HTMLFormElement) {
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
			tacit = consent && !node.querySelector(`[name="consent.${consent}"]`) || false;
		}
		return tacit ? "yes" : null;
	}
	setup(state) {
		if (state.scope.$write) return;
		const view = this.ownView;
		view.textContent = '';
		const tmpl = this.ownTpl.prerender();
		view.appendChild(tmpl.content.cloneNode(true));
		state.chain('consent', this);
	}
	chainConsent(state) {
		window.HTMLElementForm.prototype.fill.call(this, state.scope.$consent || {});
		if (this.options.transient) this.classList.remove('visible');
	}
	handleChange(e, state) {
		if (e.type == "submit" || !this.elements.find(item => item.type == "submit")) {
			this.handleSubmit(e, state);
		}
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (state.scope.$write) return;
		const consents = window.HTMLElementForm.prototype.read.call(this);
		for (const [key, val] of Object.entries(consents)) {
			state.scope.storage.set(key, val);
			state.scope.$consent[key.split('.').pop()] = val;
		}
		state.copy().runChain('consent');
	}
	patch(state) {
		if (state.scope.$write) return;
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

Page.constructor.prototype.consent = function (listener) {
	this.scope.$consent ??= {};
	const { consent } = listener.constructor;
	if (!consent) {
		console.warn("Expected a static consent field", listener);
		return;
	}
	this.scope.$consent[consent] = this.scope.storage.get('consent.' + consent) || HTMLElementConsent.ask(consent);
	this.chain('consent', listener);
};

Page.define(`element-consent`, HTMLElementConsent, 'form');


Page.paint(state => {
	state.finish(() => {
		if (!HTMLElementConsent.explicit) {
			state.copy().runChain('consent');
		}
	});
});
