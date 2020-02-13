Page.ready(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
});
Page.getConsent = function(state) {
	document.querySelectorAll('[block-type="consent_form"]').forEach((node) => {
		if (node.options.transient) node.classList.add('visible');
		HTMLCustomFormElement.prototype.fill.call(node, {
			consent: state.scope.$consent
		});
	});
};

class HTMLCustomConsentElement extends HTMLFormElement {
	static get defaults() {
		return {
			dataTransient: false
		};
	}
	setup(state) {
		var tmpl = window.customElements.get('element-template').prepareTemplate(this.firstElementChild);
		if (tmpl.content && tmpl.children.length == 0) {
			tmpl.appendChild(tmpl.content);
		}
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
		if (this.options.transient) this.classList.remove('visible');
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

