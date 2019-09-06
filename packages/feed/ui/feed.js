Page.serialize = function(state) {
	var doc = document;
	var dloc = doc.location;
	var base = dloc.protocol + '//' + dloc.host;

	function absolute(url) {
		return (new URL(url, base)).href;
	}
	var categories = [];
	var feeds = Array.from(doc.querySelectorAll('[block-type="feed"]')).map((node) => {
		var preview = node.querySelector('[block-content="preview"] [block-type="image"]');
		var topics = (node.getAttribute('feed-topics') || '').split(' - ');
		topics.forEach((topic) => {
			topic = topic.trim();
			if (topic && !categories.includes(topic)) categories.push(topic);
		});
		var title = node.querySelector('[block-content="title"]');
		if (!title) return;
		var desc = node.querySelector('[block-content="description"]');
		if (!desc) return;
		return {
			title: title.innerText,
			description: desc.innerText,
			link: absolute(node.getAttribute('feed-url')),
			date: node.getAttribute('feed-publication'),
			content: node.querySelector('[block-content="section"]').innerHTML,
			image: preview ? absolute(preview.getAttribute('url')) : null
		};
	});
	var url = dloc.toString();
	var feed = new window.Feed.Feed({
		title: state.scope.$page.data.title,
		description: state.scope.$site.title,
		link: url.replace('.rss', ''),
		generator: 'pageboard',
		feedLinks: {
			atom: url
		},
		categories: categories
	});
	feeds.forEach((item) => {
		if (!item || !item.title) return;
		item.date = new Date(item.date);
		feed.addItem(item);
	});
	var xml = feed.rss2();
	// https://github.com/jpmonette/feed/issues/87
	xml = xml.replace(/<enclosure /g, '/<enclosure type="image/*" ');
	// https://github.com/jpmonette/feed/pull/97
	xml = xml.replace('<docs>http://blogs.law.harvard.edu/tech/rss</docs>', '<docs>https://validator.w3.org/feed/docs/rss2.html</docs>');

	return xml;
};
