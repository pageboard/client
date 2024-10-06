class HTMLElementConsent extends Page.create(HTMLFormElement) {
	static defaults = {
		dataTransient: false
	};

	static ask() {
		this.waiting = false;
		let tacit = true;
		for (const node of document.querySelectorAll('[block-type="consent_form"]')) {
			node.classList.add('visible');
			tacit = false;
		}
		return !tacit;
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
		window.HTMLElementForm.prototype.fill.call(this, state.scope.$consent);
		if (this.options.transient) this.classList.remove('visible');
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (state.scope.$write) return;
		const consents = window.HTMLElementForm.prototype.read.call(this);
		for (const [key, val] of Object.entries(consents)) {
			state.scope.storage.set('consent.' + key, val);
		}
		state.scope.$consent = consents;
		state.copy().runChain('consent');
	}
	handleChange(e, state) {
		this.handleSubmit(e, state);
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
	const val = this.scope.storage.get('consent.' + consent);
	this.scope.$consent[consent] = val;
	this.chain('consent', listener);
	if (val === undefined) {
		HTMLElementConsent.waiting = true;
	} else if (val === null) {
		// setup finished but no consent is done yet, ask consent
		this.reconsent();
	}
};

Page.constructor.prototype.reconsent = function (listener) {
	if (listener) this.consent(listener);
	const consents = this.scope.$consent;
	let someAsking = false;
	for (const [key, val] of Object.entries(consents)) {
		if (listener && key != listener.constructor.consent) continue;
		let asking = false;
		if (val != "yes" && !someAsking) {
			someAsking = asking = HTMLElementConsent.ask();
		}
		if (!asking) {
			if (val == null) consents[key] = "yes";
		}
	}
	return someAsking;
};

Page.define(`element-consent`, HTMLElementConsent, 'form');


Page.paint(state => {
	state.finish(() => {
		let run = true;
		if (HTMLElementConsent.waiting) {
			if (state.reconsent()) run = false;
		}
		if (run) {
			// do not change current state stage
			state.copy().runChain('consent');
		}
	});
});
