class HTMLCustomConsentElement extends HTMLFormElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
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
		if (this.isContentEditable) return;
		if (this.options.transient) {
			const tmpl = this.ownTpl.prerender();
			if (tmpl.content && tmpl.children.length == 0) {
				tmpl.appendChild(tmpl.content);
			}
		}
		state.consent(this);
	}
	chainConsent(state) {
		window.HTMLCustomFormElement.prototype.fill.call(this, {
			consent: state.scope.$consent
		});
		if (this.options.transient) this.classList.remove('visible');
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		const fd = window.HTMLCustomFormElement.prototype.read.call(this);
		const consent = fd.consent;
		if (consent == null) {
			return;
		}
		Page.storage.set('consent', consent);
		state.scope.$consent = consent;
		state.runChain('consent');
	}
	handleChange(e, state) {
		this.handleSubmit(e, state);
	}
	patch(state) {
		if (this.isContentEditable) return;
		if (this.options.transient) {
			this.ownTpl.prerender();
		}
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

Page.ready(() => {
	VirtualHTMLElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
});

Page.State.prototype.consent = function (fn) {
	const initial = this.scope.$consent === undefined;
	let consent = Page.storage.get('consent');
	if (consent == null && initial) consent = undefined;
	this.scope.$consent = consent;
	this.chain('consent', fn);
	if (consent === undefined) {
		HTMLCustomConsentElement.waiting = true;
	} else if (consent === null) {
		// setup finished but no consent is done yet, ask consent
		this.reconsent();
	}
};

Page.State.prototype.reconsent = function (fn) {
	if (fn) this.consent(fn);
	const consent = this.scope.$consent;
	let asking = false;
	if (consent != "yes") {
		asking = HTMLCustomConsentElement.ask();
	}
	if (!asking) {
		if (consent == null) this.scope.$consent = "yes";
	}
	return asking;
};

Page.paint((state) => {
	state.finish(() => {
		let run = true;
		if (HTMLCustomConsentElement.waiting) {
			if (state.reconsent()) run = false;
		}
		if (run) state.runChain('consent');
	});
});
