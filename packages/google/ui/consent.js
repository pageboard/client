Page.setup(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
	// TODO move this to html
	Page.storage = new UserStore();
	var consent = Page.storage.get('consent');
	if (consent === null && !document.body.querySelector('element-consent')) {
		consent = "yes";
	}
	state.scope.$consent = consent;
	if (consent !== null) {
		state.runChain('consent');
	}
});

class UserStore {
	get(key) {
		var storage = window.localStorage;
		var val;
		if (storage) {
			try {
				val = storage.getItem(key);
			} catch(ex) {
				storage = null;
			}
		}
		if (!storage) {
			val = this.getCookies()[key];
		}
		return val;
	}
	set(key, val) {
		var storage = window.localStorage;
		if (storage) {
			try {
				storage.setItem(key, val);
			} catch(ex) {
				storage = null;
			}
		}
		if (!storage) {
			this.setCookie(key, val);
		}
	}
	del(key) {
		var storage = window.localStorage;
		if (storage) {
			try {
				storage.removeItem(key);
			} catch(ex) {
				storage = null;
			}
		}
		if (!storage) {
			this.clearCookie(key);
		}
	}
	clearCookies(re) {
		var cookies = this.getCookies();
		for (var key in cookies) {
			if (!re || re.test(key)) this.clearCookie(key);
		}
	}
	clearCookie(key) {
		document.cookie = `${key}=; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
	}
	getCookies() {
		return document.cookie.split(/; */).reduce((obj, str) => {
			if (str === "") return obj;
			const eq = str.indexOf('=');
			const key = eq > 0 ? str.slice(0, eq) : str;
			let val = eq > 0 ? str.slice(eq + 1) : null;
			if (val != null) try { val = decodeURIComponent(val); } catch(ex) { /* pass */ }
			obj[key] = val;
			return obj;
		}, {});
	}
	setCookie(key, val) {
		document.cookie = `${key}=${encodeURIComponent(val)}; Path=/; Secure; SameSite=Strict; Max-Age: 3e9`;
	}
}

class HTMLCustomConsentElement extends HTMLFormElement {
	static get defaults() {
		return {
			transient: false
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
		var consent = window.HTMLCustomFormElement.prototype.read.call(this).consent;
		if (consent == null) return;
		Page.storage.set('consent', consent);
		state.scope.$consent = consent;
		state.runChain('consent');
		if (this.options.transient) this.remove();
	}
	handleChange(e, state) {
		this.handleSubmit(e, state);
	}
}

