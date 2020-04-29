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
	rss(state) {
		const doc = document;
		// state.scope.$elements.blogs.properties.topics
		const topics = this.options.topics;
		const latestDate = this.blogs.reduce((cur, item) => {
			item.date = new Date(item.data.publication || item.created_at || null);
			if (item.date > cur) return item.date;
		}, new Date());

		this.blogs.forEach((item, i) => {
			const node = this.children[i];
			const image = node.querySelector('[block-content="preview"] > element-image');
			item.preview = image && image.dataset.width ? {
				url: image.dataset.src,
				width: image.dataset.width,
				height: image.dataset.height
			} : {};
		});

		const url = doc.location.toString();
		const feed = {
			title: state.scope.$page.data.title,
			description: state.scope.$site.title,
			url: url.replace('.rss', ''),
			categories: topics,
			date: latestDate,
			links: {
				rss: url
			},
			items: this.blogs
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
				<title>[items.data.title|repeat:item:item]</title>
				<link>[$loc.origin][item.data.url]</link>
				<guid>[item.id|magnet:*]</guid>
				<pubDate>[item.date|toUTCString]</pubDate>
				<description>
					<img alt="" src="[$loc.origin][item.preview.url|magnet:*]" width="[item.preview.width|magnet]" height="[item.preview.height|magnet]" />
					<p>[item.data.description|magnet:*]</p>
					[item.text|or:|html]
				</description>
			</item>
		</channel>
	</rss>`;
		var xml = (new DOMParser()).parseFromString(rssTemplate, "application/xml");
		return {
			mime: 'application/xml',
			body: (new XMLSerializer()).serializeToString(xml.fuse(feed, state.scope))
		};
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-blogs', HTMLElementBlogs);
});

