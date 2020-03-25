Page.ready(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
});

Page.State.prototype.consent = function(fn) {
	// listen for consent decisions
	this.chain('consent', () => {
		if (this.scope.$consent != null) fn(this.scope.$consent == "yes");
	});
	var consent = this.scope.$consent;
	if (consent === undefined) {
		if (this.stage == "patch") {
			fn(true);
		} else {
			// setup not finished yet
			HTMLCustomConsentElement.waiting = true;
		}
	} else if (consent === null) {
		// setup finished but no consent is done yet, ask consent
		this.reconsent();
	} else {
		// setup finished and consent was decided
		fn(consent == "yes");
	}
};

Page.State.prototype.reconsent = function(fn) {
	var consent = this.scope.$consent;
	var asking = false;
	if (consent != "yes") {
		asking = HTMLCustomConsentElement.ask();
	}
	if (!asking) {
		if (consent == null) this.scope.$consent = "yes";
		if (!this.chains.consent) this.runChain('consent');
		else if (fn) fn(this.scope.$consent == "yes");
	} else {
		if (fn) this.chain('consent', () => {
			if (this.scope.$consent != null) fn(this.scope.$consent == "yes");
		});
	}
	return asking;
};

Page.setup(function(state) {
	state.finish(function() {
		state.scope.$consent = Page.storage.get('consent');
		var run = true;
		if (HTMLCustomConsentElement.waiting) {
			if (state.reconsent()) run = false;
		}
		if (run) state.runChain('consent');
	});
});

class HTMLCustomConsentElement extends HTMLFormElement {
	static get defaults() {
		return {
			dataTransient: false
		};
	}
	static ask() {
		this.waiting = false;
		var tacit = true;
		document.querySelectorAll('[block-type="consent_form"]').forEach((node) => {
			node.classList.add('visible');
			tacit = false;
		});
		return !tacit;
	}
	setup(state) {
		var tmpl = window.customElements.get('element-template').prepareTemplate(this.firstElementChild);
		if (tmpl.content && tmpl.children.length == 0) {
			tmpl.appendChild(tmpl.content);
		}
		state.chain('consent', (state) => {
			window.HTMLCustomFormElement.prototype.fill.call(this, {
				consent: state.scope.$consent
			});
			if (this.options.transient) this.classList.remove('visible');
		});
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		var fd = window.HTMLCustomFormElement.prototype.read.call(this);
		var consent = fd.consent;
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
		if (this.options.transient) {
			window.customElements.get('element-template').prepareTemplate(this.firstElementChild);
		}
	}
}
