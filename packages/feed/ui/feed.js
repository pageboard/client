Page.patch(function(state) {
	state.finish(function(state) {
		var feeds = document.body.querySelectorAll('[block-type="feed"]');
		if (state.pathname.endsWith('.rss')) {
			return;
		}
		delete Page.serialize;
		if (feeds.length == 1) {
			var meta = Array.from(document.head.querySelectorAll('meta')).pop();
			var feed = feeds[0];
			meta.after(meta.dom(`
				<meta property="og:type" content="article">
				<meta property="og:title" content="[title]">
				<meta property="og:description" content="[description|magnet:*]">
				<meta property="og:image" content="[image.url|magnet:*]">
				<meta property="article:published_time" content="[date|magnet:*|isoDate]">
				<meta property="article:tag" content="[topics|repeat:*|magnet:*]">
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
	state.scope.$filters.toUTCString = function(val) {
		if (!val) return val;
		return val.toUTCString();
	};
	function stripBlock(node) {
		var cur;
		while ((cur = node.querySelector('[block-type]'))) {
			cur.removeAttribute('block-type');
			cur.removeAttribute('block-data');
			cur.removeAttribute('class');
		}
		return node;
	}
	var topics = node.getAttribute('feed-topics');
	if (!topics) {
		topics = node.querySelector('.topics');
		if (topics) topics = topics.innerText;
	}
	var card = {
		url: (new URL(node.getAttribute('feed-url') || "", document.baseURI)).href,
		topics: topics ? topics.split(' - ') : []
	};
	var title = node.querySelector('[block-content="title"]');
	if (title) card.title = title.innerText;
	var desc = node.querySelector('[block-content="description"]');
	card.description = desc && desc.innerText || null;
	var date = node.getAttribute('feed-publication') || node.getAttribute('pubdate');
	if (date) card.date = new Date(date);
	var preview = node.querySelector('[block-content="preview"] [block-type="image"]');
	if (preview) {
		var srcObj = new URL(preview.dataset.src, document.baseURI);
		var meta = state.data.$hrefs[srcObj.pathname];
		srcObj.search = "";
		card.image = {};
		if (meta) {
			srcObj.search = "?rs=z-" + preview.constructor.getZoom({
				w: meta.width, h: meta.height,
				rw: 320, rh: 240,
				fit: "cover"
			});
			card.image.width = 320;
			card.image.height = 240;
		}
		card.image.url = srcObj.href;
	}
	if (!card.description) {
		var content = node.querySelector('[block-content="section"]');
		if (content) {
			content = stripBlock(content.cloneNode(true));
			var xmlDoc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);

			card.content = Array.from(content.childNodes).map((node) => {
				return (new XMLSerializer()).serializeToString(xmlDoc.importNode(node, true));
			}).join('');
		}
		if (!card.content) card.content = null;
	}
	return card;
};

Page.serialize = function(state) {
	var doc = document;

	var categories = [];
	var latestDate;
	var items = Array.from(doc.querySelectorAll('[block-type="feed"]')).map((node) => {
		var card = Pageboard.getFeedCard(node, state);
		if (!card.title || !card.date) return;
		card.topics.forEach((topic) => {
			topic = topic.trim();
			if (topic && !categories.includes(topic)) categories.push(topic);
		});
		if (!latestDate) latestDate = card.date;
		else if (card.date > latestDate) latestDate = card.date;

		return card;
	}).filter((item) => !!item);
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
			<title>[items.title|repeat:item:item]</title>
			<link>[item.url]</link>
			<guid>[item.id|magnet:*]</guid>
			<pubDate>[item.date|toUTCString]</pubDate>
			<description>
				<img alt="" src="[item.image.url|magnet:*]" width="[item.image.width]" height="[item.image.height]" />
				<p>[item.description|magnet:*]</p>
				[item.content|magnet:*|html]
			</description>
		</item>
	</channel>
</rss>`;
	var xml = (new DOMParser()).parseFromString(rssTemplate, "application/xml");
	return {
		mime: 'application/xml',
		body: (new XMLSerializer()).serializeToString(xml.fuse(feed, state.scope))
	};
};

window.PageSerialize = Page.serialize;
