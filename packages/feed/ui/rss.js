Page.patch(function(state) {
	state.finish(function(state) {
		var feeds = document.body.querySelectorAll('[block-type="feed"]');
		if (feeds.length <= 1 || state.pathname.endsWith('.rss')) return;
		var node = document.head.querySelector('link,script');
		var rss = Page.format({
			pathname: state.pathname + '.rss',
			query: state.query
		});
		node.before(node.dom(`<link rel="alternate" type="application/rss+xml" title="${state.scope.$page.data.title}" href="${rss}">`));
	});
});
