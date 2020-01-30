Page.setup(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
	var consentForm = document.body.querySelector('[block-type="consent_form"]');
	if (consentForm) Page.consent = function() {
		consentForm.classList.add('visible');
	};
});

class HTMLCustomConsentElement extends HTMLFormElement {
	static get defaults() {
		return {
			dataTransient: false
		};
	}
	setup(state) {
		window.HTMLCustomFormElement.prototype.fill.call(this, {
			consent: state.scope.$consent
		});
		this.classList.toggle('visible', state.scope.$consent === null && this.options.transient || this.isContentEditable);

	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		var fd = window.HTMLCustomFormElement.prototype.read.call(this);
		var consent = fd.consent;
		if (consent == null) {
			// temp backward compat with dnt
			consent = fd.dnt;
			if (consent == "no") consent = "yes";
			else if (consent == "yes") consent = "no";
			else return;
		}
		Page.storage.set('consent', consent);
		state.scope.$consent = consent;
		state.runChain('consent');
		if (this.options.transient) this.classList.remove('visible');
	}
	handleChange(e, state) {
		this.handleSubmit(e, state);
	}
}

