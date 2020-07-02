Page.patch(function(state) {
	if (!state.scope.$site) return;
	var version = state.scope.$site.version || undefined;
	if (state.pathname.endsWith('.rss')) {
		if (version != null) state.vars.version = true;
		if (state.query.version != version) {
			Pageboard.equivs({
				Status: '301 Moved Permanently',
				Location: Page.format({
					pathname: state.pathname,
					query: Object.assign({}, state.query, {version: version})
				})
			});
		} else {
			Page.serialize = Page.rss;
		}
	} else state.finish(function(state) {
		var feeds = document.body.querySelectorAll('[block-type="feed"]');
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
				query: Object.assign({}, state.query, {version: version})
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

function getFeedCard(node, state) {
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
		if (topics) topics = topics.textContent;
	}
	var card = {
		url: (new URL(node.getAttribute('feed-url') || "", document.baseURI)).href,
		topics: topics ? topics.split(' - ') : []
	};
	var title = node.querySelector('[block-content="title"]');
	if (title) card.title = title.textContent;
	var desc = node.querySelector('[block-content="description"]');
	card.description = desc && desc.textContent ? desc.textContent.trim() : null;
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
	var content = node.querySelector('[block-content="section"]');
	if (content) {
		content = stripBlock(content.cloneNode(true));
		var xmlDoc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
		card.content = Array.from(content.childNodes).map((node) => {
			if (node.childNodes && node.childNodes.length == 0) return "";
			return (new XMLSerializer()).serializeToString(xmlDoc.importNode(node, true));
		}).join('').trim() || null;
	}
	return card;
}

Page.rss = function(state) {
	var doc = document;
	const scope = state.scope;

	var categories = [];
	var latestDate;
	var items = doc.querySelectorAll('[block-type="feed"]').map((node) => {
		var card = getFeedCard(node, state);
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
		title: scope.$page.data.title,
		description: scope.$site.title,
		url: url.replace('.rss', ''),
		categories: categories,
		date: latestDate || new Date(),
		links: {
			rss: url
		},
		items: items
	};
	const rssTemplate = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
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
			<guid isPermaLink="false">[item.id|magnet:*]</guid>
			<pubDate>[item.date|toUTCString]</pubDate>
			<media:content url="[item.image.url|magnet:*]" medium="image" width="[item.image.width]" height="[item.image.height]" />
			<description>[item.description|text|magnet]</description>
			<content:encoded>
				<img alt="" src="[item.image.url|magnet:*]" width="[item.image.width]" height="[item.image.height]" />
				[item.content|magnet:*|html]
			</content:encoded>
		</item>
	</channel>
</rss>`;
	const rssDoc = (new DOMParser()).parseFromString(rssTemplate, "application/xml");
	if (!scope.$filters.toUTCString) scope.$filters.toUTCString = function(val) {
		if (!val) return val;
		return val.toUTCString();
	};
	const rss = rssDoc.fuse(feed, scope);
	rss.querySelectorAll('encoded').forEach((node) => {
		const frag = rssDoc.createDocumentFragment();
		while (node.firstChild) frag.appendChild(node.firstChild);
		const fragStr = (new XMLSerializer()).serializeToString(frag).trim();
		if (!fragStr) {
			node.remove();
		} else {
			node.appendChild(rssDoc.createCDATASection(fragStr));
		}
	});
	return {
		mime: 'application/xml',
		body: (new XMLSerializer()).serializeToString(rss)
	};
};

