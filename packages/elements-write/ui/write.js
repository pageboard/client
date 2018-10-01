/* global getSlug */
window.Pagecut = {modules:{}};
Object.assign(window.Pageboard, {
	write: true,
	Controls: {},
	schemaHelpers: {},
	schemaFilters: {},
	trigger: function trigger(node, event) {
		var e = document.createEvent('Event'); // TODO depending on the actual event,
		// might need 'HTMLEvent' instead (or UIEvent, etc...)
		e.initEvent(event, true, true);
		node.dispatchEvent(e);
		if (window.Pageboard.editor) window.Pageboard.editor.focus();
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
		return getSlug(str, {
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
