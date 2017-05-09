(function(exports) {
	exports.page = {
		title: 'Page',
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
				spec: 'block+',
				title: 'body'
			}
		},
		view: function(doc, block) {
			doc.body.className = "ui container";
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
			'/public/semantic-ui/components/reset.css',
			'/public/semantic-ui/components/site.css',
			'/public/semantic-ui/components/container.css'
		],
		scripts: [
			'/public/js/window-page.js'
		]
	};
})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

