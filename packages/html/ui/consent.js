class HTMLElementConsent extends Page.create(HTMLFormElement) {
	static defaults = {
		dataTransient: false
	};

	static explicits = new Set();

	static ask(state, consent) {
		let tacit = true;
		if (consent) consent = 'consent.' + consent;
		const forms = document.querySelectorAll('[block-type="consent_form"]');
		const consents = state.scope.storage.all();
		for (const node of forms) {
			window.HTMLElementForm.prototype.fill.call(node, consents);
			node.classList.add('visible');
			tacit = consent && !node.querySelector(`[name="${consent}"]`) || false;
		}
		if (!tacit) this.explicits.add(consent);
		return tacit ? "yes" : null;
	}
	setup(state) {
		if (state.scope.$write) return;
		this.constructor.explicits = new Set();
		const view = this.ownView;
		view.textContent = '';
		const tmpl = this.ownTpl.prerender();
		view.appendChild(tmpl.content.cloneNode(true));
		state.chain('consent', this);
	}
	chainConsent(state) {
		if (this.options.transient) {
			this.classList.remove('visible');
		} else {
			window.HTMLElementForm.prototype.fill.call(this, state.scope.storage.all());
		}
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
		const list = Array.from(this.constructor.explicits);
		const def = consents.consent;
		for (const consent of list) {
			if (def != "custom") consents[consent] = def;
		}
		if (list.some(c => consents[c] == null)) {
			// not all explicit consents have been answered
			return;
		}
		for (const [key, val] of Object.entries(consents)) {
			state.scope.storage.set(key, val);
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

Page.constructor.prototype.consents = function (name, val) {
	const { storage } = this.scope;
	const key = "consent." + name;
	if (val === null) {
		storage.remove(key);
	} else if (val !== undefined) {
		storage.set(key, val ? "yes" : "no");
	} else {
		const str = storage.get(key);
		if (str == "yes") return true;
		else if (str == "no") return false;
		else return null;
	}
};

Page.constructor.prototype.consent = function (listener, ask) {
	const { consent } = listener.constructor;
	if (!consent) {
		console.warn("Expected a static consent field", listener);
		return;
	}
	const cur = this.consents(consent);
	if (cur == null || ask) {
		this.consents(consent, HTMLElementConsent.ask(this, consent));
	}
	this.chain('consent', listener);
};

Page.define(`element-consent`, HTMLElementConsent, 'form');


Page.paint(state => {
	state.finish(() => {
		if (!HTMLElementConsent.explicits.size) {
			// last chance for implicit consents
			state.copy().runChain('consent');
		}
	});
});
