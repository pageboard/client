Page.setup(function(state) {
	var it = window.parent.Pageboard;
	if (!it || !it.adopt || !state.data.$cache) return;
	it.adopt(window, state);
});

Page.patch(function(state) {
	state.finish(function() {
		Array.from(document.querySelectorAll('a[href]')).forEach(function(node) {
			if (!node.hasAttribute('href')) return;
			var href = Page.parse(node.getAttribute('href') || "");
			href.query.develop = state.query.develop;
			node.setAttribute('href', Page.format(href));
		});
	});
});

