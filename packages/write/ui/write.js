window.Pagecut = {modules:{}};
Object.assign(window.Pageboard, {
	write: true,
	Controls: {},
	schemaHelpers: {},
	schemaFilters: {},
	trigger(node, event, detail) {
		const opts = {
			view: window,
			bubbles: true,
			cancelable: true
		};
		let e;
		if (detail) {
			opts.detail = detail;
			e = new CustomEvent(event, opts);
		} else {
			e = new Event(event, opts);
		}
		window.queueMicrotask(() => node.dispatchEvent(e));
	},
	uiLoad(what, p) {
		const icon = what.querySelector('.icon');
		let classes;
		if (icon) {
			classes = icon.className;
			icon.className = "ui spinner icon loading";
		} else {
			what.classList.add('loading');
		}
		return p.catch(err => {
			Pageboard.notify("Request error", err);
			// rethrow, we don't want to show any result
			throw err;
		}).finally(() => {
			if (icon) icon.className = classes;
			else what.classList.remove('loading');
		});
	},
	jsonRef(obj) {
		const ref = obj.$ref;
		const prefix = '/$elements/';
		if (ref?.startsWith(prefix)) {
			delete obj.$ref;
			const name = ref.slice(prefix.length);
			const el = Pageboard.elements[name];
			for (const p of ['required', 'properties', 'type']) {
				if (el[p]) obj[p] = el[p];
			}
		}
		return obj;
	},
	service(str) {
		if (!str) return null;
		const [api, method] = str.split('.');
		const obj = Pageboard.services[api]?.[method];
		if (obj) Object.assign(this.jsonRef(obj), { api, method });
		return obj;
	}
});

