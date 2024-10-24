window.Pagecut = { modules: {} };

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
	async uiLoad(what, p) {
		window.Pageboard.notify.clear();
		const icon = what.querySelector('.icon:not(.buttons)');
		let classes;
		if (icon) {
			classes = icon.className;
			icon.className = "ui spinner icon loading";
		} else {
			what.classList.add('loading');
		}
		try {
			const ret = await p;
			if (ret?.status && ret.status >= 400) throw ret;
			return ret;
		} catch (err) {
			window.Pageboard.notify("Error" + (err.status ? ` ${err.status}` : ''), {
				message: err.statusText
			});
			// rethrow, we don't want to show any result
			throw err;
		} finally {
			if (icon) icon.className = classes;
			else what.classList.remove('loading');
		}
	}
});

