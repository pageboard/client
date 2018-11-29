Pageboard.elements.embed = {
	title: "Embed",
	// icon: '<i class="external icon"></i>', // FIXME embeds are a hack
	menu: "widget",
	properties: {
		url: {
			title: 'Address',
			description: 'The iframe src URL',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}]
			// TODO plug embeds to href, but url-inspector makes it difficult for us right now
		},
		template: {
			title: 'Template',
			description: 'Query template',
			type: 'string',
			context: 'query|form'
		}
	},
	group: "block",
	parse: function(dom) {
		return {
			url: dom.getAttribute('src')
		};
	},
	tag: 'iframe,element-embed',
	render: function(doc, block, view) {
		var d = block.data;
		var node = doc.dom`<element-embed class="ui embed" src="${d.url}"></element-embed>`;
		if (d.template) node.data.src = d.template;
		return node;
	},
	scripts: ['../ui/embed.js'],
	stylesheets: [
		'../semantic-ui/embed.css',
		'../ui/embed.css'
	]
};

