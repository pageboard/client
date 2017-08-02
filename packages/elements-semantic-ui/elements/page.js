
Pageboard.elements.page = {
	title: 'Page',
	group: 'page',
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null']
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "(\/[a-zA-Z0-9-.]*)+"
		}
	},
	contents: {
		body: {
			spec: '(block|container)+',
			title: 'body'
		}
	},
	icon: '<i class="icon file outline"></i>',
	render: function(doc, block) {
		doc.body.setAttribute('block-content', "body");
		// title
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
		'/.pageboard/semantic-ui/components/site.css',
		'/.pageboard/semantic-ui/components/container.css'
	],
	scripts: [
		'/.pageboard/read/window-page.js',
		'/.pageboard/read/dom-template-strings.js',
		'ui/custom-elements.min.js'
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
	},
});

