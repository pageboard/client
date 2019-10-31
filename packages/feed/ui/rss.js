Page.serialize = function(state) {
	var doc = document;

	var categories = [];
	var latestDate;
	var items = Array.from(doc.querySelectorAll('[block-type="feed"]')).map((node) => {
		var card = Pageboard.getFeedCard(node, state);
		if (!card.title || !card.description || !card.date) return;
		card.topics.forEach((topic) => {
			topic = topic.trim();
			if (topic && !categories.includes(topic)) categories.push(topic);
		});
		if (!latestDate) latestDate = card.date;
		else if (card.date > latestDate) latestDate = card.date;

		return card;
	});
	var url = doc.location.toString();
	var feed = {
		title: state.scope.$page.data.title,
		description: state.scope.$site.title,
		url: url.replace('.rss', ''),
		categories: categories,
		date: latestDate || new Date(),
		links: {
			rss: url
		},
		items: items
	};
	const rssTemplate = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>[title]</title>
		<link>[url]</link>
		<description>[description]</description>
		<lastBuildDate>[date|toUTCString]</lastBuildDate>
		<docs>https://validator.w3.org/feed/docs/rss2.html</docs>
		<generator>Pageboard</generator>
		<category>[categories|repeat:*]</category>
		<atom:link href="[links.rss]" rel="self" type="application/rss+xml"/>
		<item>
			<title>[items.title|repeat:item:item|cdata]</title>
			<link>[item.url]</link>
			<guid>[item.id|magnet:*]</guid>
			<pubDate>[item.date|toUTCString]</pubDate>
			<description>[item.description|magnet|cdata]</description>
			<content:encoded>[item.content|magnet|cdata]</content:encoded>
			<enclosure url="[item.enclosure.url|magnet:*]" length="[item.enclosure.length|magnet]" type="[item.enclosure.type|magnet]" />
		</item>
	</channel>
</rss>`;
	var xml = (new DOMParser()).parseFromString(rssTemplate, "application/xml");
	state.scope.$filters.cdata = function(val, what) {
		what.mode = "html";
		return '<![CDATA[' + val + ']]>';
	};
	return (new XMLSerializer()).serializeToString(xml.fuse(feed, state.scope));
};

