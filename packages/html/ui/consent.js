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
		if (this.options.transient) {
			const tmpl = this.ownTpl.prerender();
			if (tmpl.content && tmpl.children.length == 0) {
				tmpl.appendChild(tmpl.content);
			}
		}
		state.consent(this);
	}
	chainConsent(state) {
		window.HTMLElementForm.prototype.fill.call(this, {
			consent: state.scope.$consent
		});
		if (this.options.transient) this.classList.remove('visible');
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (state.scope.$write) return;
		const fd = window.HTMLElementForm.prototype.read.call(this);
		const consent = fd.consent;
		if (consent == null) {
			return;
		}
		state.scope.storage.set('consent', consent);
		state.scope.$consent = consent;
		state.copy().runChain('consent');
	}
	handleChange(e, state) {
		this.handleSubmit(e, state);
	}
	patch(state) {
		if (state.scope.$write) return;
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

Page.constructor.prototype.consent = function (fn) {
	const initial = this.scope.$consent === undefined;
	let consent = this.scope.storage.get('consent');
	if (consent == null && initial) consent = undefined;
	this.scope.$consent = consent;
	this.chain('consent', fn);
	if (consent === undefined) {
		HTMLElementConsent.waiting = true;
	} else if (consent === null) {
		// setup finished but no consent is done yet, ask consent
		this.reconsent();
	}
};

Page.constructor.prototype.reconsent = function (fn) {
	if (fn) this.consent(fn);
	const consent = this.scope.$consent;
	let asking = false;
	if (consent != "yes") {
		asking = HTMLElementConsent.ask();
	}
	if (!asking) {
		if (consent == null) this.scope.$consent = "yes";
	}
	return asking;
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
