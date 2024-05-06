class HTMLElementBlogs extends Page.Element {
	static defaults = {
		topics: (x) => (x || '').split(',').filter(x => Boolean(x))
	};

	async patch(state) {
		const blogPath = state.pathname.replace(/\.rss$/, '');
		this.dataset.url = blogPath; // see write's page-title input helper
		const topics = this.options.topics;
		// if (topics && !Array.isArray(topics)) topics = [topics];
		const res = await state.fetch('get', '/@api/blocks', {
			type: 'blog',
			data: {
				'url:start': blogPath + (blogPath != '/' ? '/' : ''),
				'topics:in': topics,
				nositemap: state.scope.$write ? undefined : false
			},
			content: true,
			order: ['-data.publication', 'data.index']
		});
		const scope = state.scope.copy();
		await scope.import(res);
		this.blogs = res.items;
		state.scope.$element = state.scope.$elements.blogs; // might not be needed
		this.textContent = '';

		const frag = scope.render(res, {
			name: 'blogs-content',
			html: '<div block-id="[items|repeat:item|.id]" block-type="item[item.type]" />'
		});
		this.appendChild(frag);
	}
	build(state) {
		const version = state.scope.$parent.data?.version || undefined;
		if (state.pathname.endsWith('.rss')) {
			if (version != null) state.vars.version = true;
			if (state.query.version != version) {
				state.status = 302;
				state.statusText = 'Found Version';
				state.location = Page.format({
					pathname: state.pathname,
					query: {...state.query, version }
				});
			} else {
				Page.constructor.serialize = (state) => this.rss(state);
			}
		} else {
			const link = Page.format({
				pathname: state.pathname + '.rss',
				query: { ...state.query, version }
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
		let cur;
		while ((cur = node.querySelector('[block-type]'))) {
			cur.removeAttribute('block-type');
			cur.removeAttribute('block-data');
			cur.removeAttribute('class');
		}
		return node;
	}
	rss(state) {
		const doc = document;
		const { scope } = state;
		// scope.$elements.blogs.properties.topics
		const topics = this.options.topics;
		const latestDate = this.blogs.reduce((cur, item) => {
			item.date = new Date(item.data.publication || item.created_at || null);
			if (item.date > cur) cur = item.date;
			return cur;
		}, new Date());

		const xmlDoc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
		const xmlSer = new XMLSerializer();

		this.blogs.forEach((item, i) => {
			const node = this.children[i];
			const image = node.querySelector('[block-content="preview"] > element-image');
			item.preview = image.dataset?.width ? {
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
			title: scope.$page.content.title,
			description: scope.$page.data.description ??scope.$parent.data.title,
			url: url.replace('.rss', ''),
			categories: topics,
			date: latestDate,
			links: {
				rss: url
			},
			items: this.blogs
		};

		// FIXME this template needs an upgrade
		const rssTemplate = `<?xml version="1.0" encoding="utf-8"?>
	<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
		<channel>
			<title>[title]</title>
			<link>[url]</link>
			<description>[description]</description>
			<lastBuildDate>[date|date:utc]</lastBuildDate>
			<docs>https://validator.w3.org/feed/docs/rss2.html</docs>
			<generator>Pageboard</generator>
			<category>[categories|repeat:*]</category>
			<atom:link href="[links.rss]" rel="self" type="application/rss+xml"/>
			<item>
				<title>[items|at:item|repeat:item|.data.title]</title>
				<link>[$loc.origin][item.data.url]</link>
				<guid isPermaLink="false">[item.id|fail:*]</guid>
				<pubDate>[item.date|date:utc]</pubDate>
				<media:content url="[$loc.origin][item.preview.url|fail:*]" medium="image" width="[item.preview.width]" height="[item.preview.height]" />
				<description>[item.description|text|fail:*]</description>
				<content:encoded>
					<img alt="" src="[$loc.origin][item.preview.url|fail:*]" width="[item.preview.width]" height="[item.preview.height]" />
					<p>[item.content|as:html|fail:*]</p>
				</content:encoded>
			</item>
		</channel>
	</rss>`;
		const rssDoc = (new DOMParser()).parseFromString(rssTemplate, "application/xml");
		const rss = rssDoc.fuse(feed, scope);
		for (const node of rss.querySelectorAll('encoded')) {
			const frag = rssDoc.createDocumentFragment();
			while (node.firstChild) frag.appendChild(node.firstChild);
			const fragStr = (new XMLSerializer()).serializeToString(frag).trim();
			if (!fragStr) {
				node.remove();
			} else {
				node.appendChild(rssDoc.createCDATASection(fragStr));
			}
		}
		return {
			mime: 'application/xml',
			body: (new XMLSerializer()).serializeToString(rss)
		};
	}
}

Page.define('element-blogs', HTMLElementBlogs);
