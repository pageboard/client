Page.ready(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
});
Page.getConsent = function(state) {
	document.querySelectorAll('[block-type="consent_form"]').forEach((node) => {
		node.classList.add('visible');
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
		state.chain('consent', (state) => {
			window.HTMLCustomFormElement.prototype.fill.call(this, {
				consent: state.scope.$consent
			});
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

Page.setup(function(state) {
	state.chain('consent', (state) => {
		Page.storage.set('consent', state.scope.$consent);
	});
	state.finish(() => {
		var consent = Page.storage.get('consent');
		if (consent === null && state.scope.$write) {
			consent = "yes";
		}
		state.scope.$consent = consent;
		if (consent !== null) {
			state.runChain('consent');
		} else if (state.chains.consent.length) {
			Page.getConsent(state);
		}
	});
});

