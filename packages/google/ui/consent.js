Page.ready((state) => {
	state.userStorage = new UserStore();
});
Page.setup(function(state) {
	HTMLCustomElement.define(`element-consent`, HTMLCustomConsentElement, 'form');
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
	parseDnt(val) {
		if (0 === parseInt(val) || 'no' == val) return 'no';
		else if (1 === parseInt(val) || 'yes' == val) return 'yes';
		else return null;
	}
	setup(state) {
		var navDnt = this.parseDnt((navigator.doNotTrack !== undefined) ? navigator.doNotTrack
			: (window.doNotTrack !== undefined) ? window.doNotTrack
				: (navigator.msDoNotTrack !== undefined) ? navigator.msDoNotTrack
					: null);
		var userDnt = state.userStorage.get('dnt');
		var dnt = userDnt !== null ? userDnt : navDnt;
		window.HTMLCustomFormElement.prototype.fill.call(this, {dnt: dnt});
		this.classList.toggle('visible', dnt === null && this.options.transient || this.isContentEditable);
		state.runChain('dnt');
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (this.isContentEditable) return;
		var dnt = window.HTMLCustomFormElement.prototype.read.call(this).dnt;
		if (dnt == null) return;
		state.userStorage.set('dnt', dnt);
		state.runChain('dnt');
		this.classList.remove('visible');
	}
	handleChange(e, state) {
		this.handleSubmit(e, state);
	}
}

