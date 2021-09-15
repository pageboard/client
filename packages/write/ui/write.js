window.Pagecut = {modules:{}};
Object.assign(window.Pageboard, {
	write: true,
	Controls: {},
	schemaHelpers: {},
	schemaFilters: {},
	trigger: function trigger(node, event, detail) {
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
		node.dispatchEvent(e);
	},
	uiLoad: function uiLoad(what, p) {
		const icon = what.querySelector('.icon');
		let classes;
		if (icon) {
			classes = icon.className;
			icon.className = "ui spinner icon loading";
		} else {
			what.classList.add('loading');
		}
		return p.catch((err) => {
			Pageboard.notify("Request error", err);
			// rethrow, we don't want to show any result
			throw err;
		}).finally(() => {
			if (icon) icon.className = classes;
			else what.classList.remove('loading');
		});
	},
	slug: function(str) {
		return window.getSlug(str, {
			custom: {
				"_": "-"
			}
		});
	}
});

