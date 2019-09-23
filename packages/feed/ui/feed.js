Page.serialize = function(state) {
	var doc = document;
	var dloc = doc.location;
	var base = dloc.protocol + '//' + dloc.host;

	function absolute(url) {
		return (new URL(url, base)).href;
	}
	function stripBlock(node) {
		var cur;
		while ((cur = node.querySelector('[block-id],[block-type]'))) {
			cur.removeAttribute('block-id');
			cur.removeAttribute('block-type');
		}
		return node;
	}
	var categories = [];
	var firstPubDate;
	var feeds = Array.from(doc.querySelectorAll('[block-type="feed"]')).map((node) => {
		var preview = node.querySelector('[block-content="preview"] [block-type="image"] > img');
		var topics = (node.getAttribute('feed-topics') || '').split(' - ');
		topics.forEach((topic) => {
			topic = topic.trim();
			if (topic && !categories.includes(topic)) categories.push(topic);
		});
		var title = node.querySelector('[block-content="title"]');
		if (!title) return;
		var desc = node.querySelector('[block-content="description"]');
		if (!desc) return;
		var pubDate = node.getAttribute('feed-publication');
		if (!firstPubDate) firstPubDate = pubDate;

		if (preview) preview.src = absolute(preview.src);

		return {
			title: title.innerText,
			description: (preview ? preview.outerHTML : '') + desc.innerText,
			link: absolute(node.getAttribute('feed-url')),
			date: pubDate,
			content: stripBlock(node.querySelector('[block-content="section"]')).innerHTML
		};
	});
	var url = dloc.toString();
	var feed = new window.Feed.Feed({
		title: state.scope.$page.data.title,
		description: state.scope.$site.title,
		link: url.replace('.rss', ''),
		updated: firstPubDate ? new Date(firstPubDate) : new Date(),
		generator: 'Pageboard',
		feedLinks: {
			atom: url
		}
	});
	categories.forEach((cat) => feed.addCategory(cat));
	feeds.forEach((item) => {
		if (!item || !item.title) return;
		item.date = new Date(item.date);
		feed.addItem(item);
	});
	return feed.rss2().toString();
};
