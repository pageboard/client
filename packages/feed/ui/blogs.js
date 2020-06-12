class HTMLElementBlogs extends HTMLCustomElement {
	static get defaults() {
		return {
			topics: (x) => (x || '').split(',').filter((x) => !!x)
		};
	}

	patch(state) {
		const blogPath = state.pathname.replace(/\.rss$/, '');
		this.dataset.url = blogPath; // see write's page-title input helper
		let topics = this.options.topics;
		// if (topics && !Array.isArray(topics)) topics = [topics];
		return Pageboard.bundle(Pageboard.fetch('get', '/.api/blocks', {
			type: 'blog',
			data: {
				'url:start': blogPath + (blogPath != '/' ? '/' : ''),
				'topics:in': topics,
				nositemap: state.scope.$write ? undefined : false
			},
			content: true,
			order: ['-data.publication', 'data.index']
		}), state).then(res => {
			this.blogs = res.items;
			state.scope.$element = state.scope.$elements.blogs;
			this.textContent = '';
			const frag = Pageboard.render({
				item: {},
				items: res.items
			}, state.scope, {
				name: 'blogs-content',
				html: '<div block-id="[$items.id|repeat:*:item]" block-type="item[item.type]" />'
			});
			this.appendChild(frag);
		});
	}
	build(state) {
		const version = state.scope.$site.version || undefined;
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
				Page.serialize = (state) => this.rss(state);
			}
		} else {
			const link = Page.format({
				pathname: state.pathname + '.rss',
				query: Object.assign({}, state.query, {version: version})
			});
			let node = document.head.querySelector('link[rel="alternate"][type="application/rss+xml"]');
			if (!node) {
				node = document.head.querySelector('link,script');
				node.before(node.dom(`
					<link rel="alternate" type="application/rss+xml" title="[$page.data.title]" href="[link]">
				`).fuse({
					link:link
				}, state.scope));
			}
		}
	}
	strip(node) {
		node = node.cloneNode(true);
		var cur;
		while ((cur = node.querySelector('[block-type]'))) {
			cur.removeAttribute('block-type');
			cur.removeAttribute('block-data');
			cur.removeAttribute('class');
		}
		return node;
	}
	rss(state) {
		const doc = document;
		const scope = state.scope;
		// scope.$elements.blogs.properties.topics
		const topics = this.options.topics;
		const latestDate = this.blogs.reduce((cur, item) => {
			item.date = new Date(item.data.publication || item.created_at || null);
			if (item.date > cur) return item.date;
		}, new Date());

		const xmlDoc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
		const xmlSer = new XMLSerializer();

		this.blogs.forEach((item, i) => {
			const node = this.children[i];
			const image = node.querySelector('[block-content="preview"] > element-image');
			item.preview = image && image.dataset.width ? {
				url: image.dataset.src,
				width: image.dataset.width,
				height: image.dataset.height
			} : {};
			let desc = node.querySelector('[block-content="description"]');
			if (desc) {
				desc = this.strip(desc);
				item.content = desc.childNodes.map(node => {
					return xmlSer.serializeToString(xmlDoc.importNode(node, true));
				}).join('').trim();
				if (item.content === "") item.content = null;
				item.description = desc.textContent;
				if (item.description === "") item.description = null;
			}
		});

		const url = doc.location.toString();
		const feed = {
			title: scope.$page.data.title,
			description: scope.$site.title,
			url: url.replace('.rss', ''),
			categories: topics,
			date: latestDate,
			links: {
				rss: url
			},
			items: this.blogs
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
				<title>[items.data.title|repeat:item:item]</title>
				<link>[$loc.origin][item.data.url]</link>
				<guid isPermaLink="false">[item.id|magnet:*]</guid>
				<pubDate>[item.date|toUTCString]</pubDate>
				<media:content url="[$loc.origin][item.preview.url|magnet:*]" medium="image" width="[item.preview.width|magnet]" height="[item.preview.height|magnet]" />
				<description>[item.description|text|magnet]</description>
				<content:encoded>
					<img alt="" src="[$loc.origin][item.preview.url|magnet:*]" width="[item.preview.width|magnet]" height="[item.preview.height|magnet]" />
					<p>[item.content|html|magnet]</p>
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
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-blogs', HTMLElementBlogs);
});

