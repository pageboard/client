
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
		url: {
			title: 'Address',
			type: "string",
			pattern: "(\/[a-zA-Z0-9-.]*)+",
			input: {
				name: 'pageUrl'
			}
		},
		redirect: {
			title: 'Redirect',
			type: "string",
			format: "uri",
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
		}
	},
	contents: {
		body: {
			spec: 'header? main+ footer?',
			title: 'body'
		}
	},
	icon: '<i class="icon file outline"></i>',
	render: function(doc, block) {
		if (block.data.redirect && block.data.redirect != block.data.url) {
			doc.head.appendChild(doc.dom`<meta http-equiv="Status" content="302 Found">
	<meta http-equiv="Location" content="${block.data.redirect}">`);
		}
		doc.body.setAttribute('block-content', "body");
		var title = doc.head.querySelector('title');
		if (!title) {
			title = doc.createElement('title');
			doc.head.insertBefore(title, doc.head.firstChild);
		}
		title.textContent = block.data.title || '';
		return doc.body;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/reset.css',
		'../ui/site.css'
	],
	scripts: [
		'/.pageboard/read/window-page.js',
		'/.pageboard/read/dom-template-strings.js',
		'../ui/custom-elements.min.js'
	]
};

// extend page
Pageboard.elements.notfound = Object.assign({}, Pageboard.elements.page, {
	title: 'Page not found',
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null']
		}
	},
	render: function(doc, block) {
		doc.head.appendChild(doc.dom`<meta http-equiv="Status" content="404 Not Found">`);
		return Pageboard.elements.page.render(doc, block);
	}
});

