Page.ready(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
});
Page.init(function(state) {
	state.consent = function(fn) {
		if (fn) this.chain('consent', (state) => {
			return fn(state.scope.$consent == "yes");
		});
		this.consent.ask = true;
	};
	state.consent.get = function() {
		var tacit = true;
		document.querySelectorAll('[block-type="consent_form"]').forEach((node) => {
			node.classList.add('visible');
			tacit = false;
		});
		return tacit;
	};
});
Page.setup(function(state) {
	state.finish(function() {
		if (!state.consent.ask) return;
		var consent = Page.storage.get('consent');
		var tacit = consent === null;
		if (tacit) tacit = state.consent.get();
		if (tacit) {
			console.warn("Got tacit consent, please add a Form Consent to this page");
			consent = "yes";
		}
		if (consent !== null) {
			state.scope.$consent = consent;
			state.runChain('consent');
		}
	});
});

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
		Page.storage.set('consent', consent);
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
