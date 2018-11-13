window.Pagecut = {modules:{}};
Object.assign(window.Pageboard, {
	write: true,
	Controls: {},
	schemaHelpers: {},
	schemaFilters: {},
	trigger: function trigger(node, event, detail) {
		var opts = {
			view: window,
			bubbles: true,
			cancelable: true
		};
		var e;
		if (detail) {
			opts.detail = detail;
			e = new CustomEvent(event, opts);
		} else {
			e = new Event(event, opts);
		}
		node.dispatchEvent(e);
	},
	uiLoad: function uiLoad(what, p) {
		var classList = what.classList;
		classList.add('loading');
		return p.catch(function(err) {
			classList.remove('loading');
			Pageboard.notify("Loading error", err);
			// rethrow, we don't want to show any result
			throw err;
		}).then(function(res) {
			classList.remove('loading');
			return res;
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

Page.patch(function(state) {
	Pageboard.patch(state);
});
Page.setup(function(state) {
	Pageboard.setup(state);
});
