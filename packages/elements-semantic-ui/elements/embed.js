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
		placeholder: {
			title: 'Placeholder',
			description: 'The iframe previsualisation image',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}]
		},
		autoPlay: {
			title: 'Auto play',
			type: "boolean",
			default: false
		}
	},
	group: "block",
	parse: function(dom) {
		var attrs = {};
		if (dom.matches('iframe')) {
			attrs.url = dom.getAttribute('src');
		} else {
			Object.keys(this.properties).forEach(function(key) {
				if (dom.dataset[key]) attrs[key] = dom.dataset[key];
			});
		}
		return attrs;
	},
	tag: 'iframe,element-embed',
	html: `<element-embed class="ui embed" data-url="[url]" data-auto-play="[autoPlay]" data-placeholder="[placeholder]"></element-embed>`,
	scripts: ['../ui/embed.js'],
	stylesheets: [
		'../lib/components/embed.css',
		'../ui/embed.css'
	]
};

