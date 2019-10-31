Page.patch(function(state) {
	state.finish(function(state) {
		var feeds = document.body.querySelectorAll('[block-type="feed"]');
		if (state.pathname.endsWith('.rss')) {
			return;
		} else if (feeds.length == 1) {
			var meta = Array.from(document.head.querySelectorAll('meta')).pop();
			var feed = feeds[0];
			meta.after(meta.dom(`
				<meta property="og:type" content="summary">
				<meta property="og:title" content="[title]">
				<meta property="og:description" content="[description|magnet=*]">
				<meta property="og:image" content="[enclosure.url|magnet=*]" />
			`).fuse(Pageboard.getFeedCard(feed, state), state.scope));
		} else if (feeds.length > 1) {
			var link = Page.format({
				pathname: state.pathname + '.rss',
				query: state.query
			});
			var node = document.head.querySelector('link[rel="alternate"][type="application/rss+xml"]');
			if (!node) {
				var cur = document.head.querySelector('link,script');
				cur.before(cur.dom(`
					<link rel="alternate" type="application/rss+xml" title="[$page.data.title]" href="[link]">
				`).fuse({
					link:link
				}, state.scope));
			}
		}
	});
});

Pageboard.getFeedCard = function(node, state) {
	function stripBlock(node) {
		var cur;
		while ((cur = node.querySelector('[block-type]'))) {
			cur.removeAttribute('block-type');
		}
		return node;
	}
	var card = {
		url: (new URL(node.getAttribute('feed-url'), document.baseURI)).href,
		topics: (node.getAttribute('feed-topics') || '').split(' - ')
	};
	var title = node.querySelector('[block-content="title"]');
	if (title) card.title = title.innerText;
	var desc = node.querySelector('[block-content="description"]');
	if (desc) card.description = desc.innerText;
	var date = node.getAttribute('feed-publication');
	if (date) card.date = new Date(date);
	var preview = node.querySelector('[block-content="preview"] [block-type="image"]');
	if (preview) {
		var srcObj = new URL(preview.getAttribute('url'), document.baseURI);
		var srcMeta = state.data.$hrefs[srcObj.pathname];
		srcObj.search = "";
		card.enclosure = {
			url: srcObj.href
		};
		if (srcMeta) {
			card.enclosure.type = srcMeta.mime;
			card.enclosure.length = srcMeta.size;
		}
	}
	var content = node.querySelector('[block-content="section"]');
	if (content) card.content = stripBlock(content.cloneNode(true)).innerHTML;
	return card;
};
