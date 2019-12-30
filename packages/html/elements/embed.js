exports.embed = {
	title: "Embed",
	// icon: '<i class="external icon"></i>', // FIXME embeds are a hack
	menu: "widget",
	properties: {
		url: {
			title: 'Address',
			description: 'The iframe src URL',
			nullable: true,
			type: 'string',
			format: 'uri-reference'
			// TODO plug embeds to href, but url-inspector makes it difficult for us right now
		},
		name: {
			title: 'Name',
			type: 'string',
			format: 'id',
			nullable: true
		}
	},
	group: "block",
	parse: function(dom) {
		return {
			url: dom.dataset.src || dom.getAttribute('src')
		};
	},
	tag: 'iframe,element-embed',
	html: `<element-embed class="ui embed" data-src="[url]" id="[name|id]" data-loading="lazy"></element-embed>`,
	scripts: [
		'../ui/storage.js',
		'../ui/consent.js',
		'../ui/embed.js'
	],
	stylesheets: [
		'../ui/loading.css',
		'../lib/components/embed.css',
		'../ui/embed.css'
	]
};

