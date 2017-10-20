Pageboard.elements.embed = {
	title: "Embed",
	properties: {
		url: {
			title: 'Address',
			description: 'The iframe src URL',
			type: "string",
			format: "uri"
			// TODO plug embeds to href, but url-inspector makes it difficult for us right now
		},
		placeholder: {
			title: 'Placeholder',
			description: 'The iframe previsualisation image',
			type: "string",
			format: "uri"
		},
		autoPlay: {
			title: 'Auto play',
			type: "boolean",
			default: false
		}
	},
	group: "block",
//	icon: '<i class="external icon"></i>',
	parse: function(dom) {
		var attrs = {};
		if (dom.matches('iframe')) attrs.url = dom.getAttribute('src');
		return attrs;
	},
	tag: 'iframe,element-embed',
	render: function(doc, block, view) {
		var d = block.data;
		var node = doc.dom`<element-embed class="ui embed" data-url="${d.url}" data-auto-play="${!view.editable && d.autoPlay}"></element-embed>`;
		if (d.placeholder) node.setAttribute('data-placeholder', d.thumbnail);
		return node;
	},
	scripts: ['../ui/embed.js'],
	stylesheets: [
		'/.pageboard/semantic-ui/components/embed.css',
		'../ui/embed.css'
	]
};

