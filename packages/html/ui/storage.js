class UserStore {
	#store = window.localStorage ?? {};
	all() {
		return this.#store;
	}
	get(key) {
		try {
			return this.#store.getItem(key);
		} catch (ex) {
			console.error(ex);
		}
	}
	set(key, val) {
		try {
			if (val == null) return this.del(key);
			else return this.#store.setItem(key, val);
		} catch (ex) {
			console.error(ex);
		}
	}
	del(key) {
		try {
			return this.#store.removeItem(key);
		} catch (ex) {
			console.error(ex);
		}
	}
	clearCookies(re) {
		const cookies = this.getCookies();
		for (const [key, val] of Object.entries(cookies)) {
			if (!re || re.test(key)) this.clearCookie(key, val);
		}
	}
	clearCookie(key, opts) {
		let str = `${key}=; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
		if (opts.Path) str += '; Path=' + opts.Path;
		if (opts.Domain) str += '; Domain=' + opts.Domain;
		document.cookie = str;
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

Page.paint(() => Page.storage = new UserStore());

