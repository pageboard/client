Pageboard.elements.page = {
	priority: -100,
	replaces: 'doc',
	title: 'Page',
	group: 'page',
	standalone: true, // besides site, can be child of zero or more parents
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null'],
			input: {
				name: 'pageTitle'
			}
		},
		description: {
			title: 'Description',
			type: ['string', 'null'],
			input: {
				multiline: true
			}
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "^(/[a-zA-Z0-9-.]*)+$", // notice the absence of underscore
			input: {
				// works with sitemap editor to update pages url in a coherent manner
				// see also page.save: the href updater will only change input.name == "href".
				name: 'pageUrl'
			}
		},
		redirect: {
			title: 'Redirect',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[a-zA-Z0-9-.]*)+$" // notice the absence of underscore
			}],
			input: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
		index: {
			type: "integer",
			default: 0,
			minimum: 0
		},
		noindex: {
			title: 'Block search engine indexing',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		body: {
			spec: 'block+',
			title: 'body'
		}
	},
	icon: '<i class="icon file outline"></i>',
	render: function(doc, block) {
		var d = block.data;
		if (d.redirect && d.redirect != d.url && (!d.transition || !d.transition.from)) {
			doc.head.appendChild(doc.dom`<meta http-equiv="Status" content="302 Found">
	<meta http-equiv="Location" content="${d.redirect}">`);
		}
		var metas = [{
			name: "viewport",
			value: "width=device-width, initial-scale=1"
		}];
		if (d.noindex) metas.push({
			name: "robots",
			value: "noindex"
		});
		if (d.description) metas.push({
			name: "description",
			value: d.description
		});
		metas.forEach(function(meta) {
			doc.head.appendChild(doc.dom`<meta name="${meta.name}" content="${meta.value}">`);
		});
		doc.body.setAttribute('block-content', "body");
		var title = doc.head.querySelector('title');
		if (!title) {
			title = doc.createElement('title');
			doc.head.insertBefore(title, doc.head.firstChild);
		}
		var site = Pageboard.site;
		if (site) {
			if (site.favicon) {
				doc.head.appendChild(doc.dom`<link rel="icon" href="${site.favicon}">`);
			}
			if (site.lang) {
				doc.documentElement.lang = site.lang;
			}
		} else {
			console.warn("no site set");
		}
		title.textContent = d.title || '';
		return doc.body;
	},
	scripts: [
		'../lib/custom-elements.js',
		'../lib/window-page.js',
		'../ui/pageboard.js'
	]
};

// extend page
Pageboard.elements.notfound = Object.assign({}, Pageboard.elements.page, {
	title: 'Page not found',
	properties: Object.assign({}, Pageboard.elements.page.properties),
	render: function(doc, block, view) {
		doc.head.appendChild(doc.dom`<meta http-equiv="Status" content="404 Not Found">`);
		return this.pageRender(doc, block, view);
	}
});
Pageboard.elements.notfound.pageRender = Pageboard.elements.page.render;
delete Pageboard.elements.notfound.properties.url;

