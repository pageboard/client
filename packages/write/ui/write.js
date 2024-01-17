window.Pagecut = { modules: {} };

Object.assign(window.Pageboard, {
	write: true,
	Controls: {},
	schemaHelpers: {},
	schemaFilters: {},
	schemas: {},
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
		const icon = what.querySelector('.icon:not(.buttons)');
		let classes;
		if (icon) {
			classes = icon.className;
			icon.className = "ui spinner icon loading";
		} else {
			what.classList.add('loading');
		}
		return p.catch(err => {
			window.Pageboard.notify("Request error", err);
			// rethrow, we don't want to show any result
			throw err;
		}).finally(() => {
			if (icon) icon.className = classes;
			else what.classList.remove('loading');
		});
	}
});

for (const name of ['elements', 'services']) {
	const definitions = window.Pageboard[name];
	// TODO this hard-coded translation could be avoided
	window.Pageboard.schemas[name] = {
		$id: '/' + name,
		definitions,
		discriminator: {
			propertyName: name == 'elements' ? 'type' : 'method'
		},
		oneOf: Object.keys(definitions).map(key => {
			return { $ref: '#/definitions/' + key };
		})
	};
}
