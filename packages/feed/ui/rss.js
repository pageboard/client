Page.patch(function(state) {
	state.finish(function(state) {
		var feeds = document.body.querySelectorAll('[block-type="feed"]');
		if (feeds.length <= 1 || state.pathname.endsWith('.rss')) return;
		var rss = Page.format({
			pathname: state.pathname + '.rss',
			query: state.query
		});
		var node = document.head.querySelector('link[rel="alternate"][type="application/rss+xml"]');
		if (!node) {
			var cur = document.head.querySelector('link,script');
			cur.before(cur.dom(`<link rel="alternate" type="application/rss+xml" title="${state.scope.$page.data.title}" href="${rss}">`));
		}
	});
});
