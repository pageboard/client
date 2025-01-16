exports.embed = {
	title: "Embed",
	menu: "media",
	icon: '<i class="external square alternate icon"></i>',
	properties: {
		id: {
			nullable: true,
			type: 'string',
			pattern: /^[a-z0-9-]*$/.source
		},
		linkable: {
			title: 'Show hash link',
			type: 'boolean',
			default: false
		},
		url: {
			title: 'Address',
			description: 'The iframe src URL',
			nullable: true,
			type: 'string',
			format: 'uri-reference',
			$helper: {
				name: 'href',
				filter: {
					type: ["embed"]
				}
			}
		},
		query: {
			title: 'Additional query parameters',
			type: 'object',
			nullable: true
		},
		ratio: {
			title: 'Default height/width',
			description: 'Inverse of ratio in percents',
			type: 'number',
			minimum: 10,
			maximum: 500,
			multipleOf: 0.01,
			nullable: true
		}
	},
	group: "block",
	parse: function (dom) {
		if (dom.matches('element-embed')) return;
		return {
			url: dom.getAttribute('src')
		};
	},
	tag: 'iframe,element-embed',
	html: `<element-embed data-src="[url]" data-query="[query|as:query]" id="[id]" style-padding-bottom="[ratio|fail:]%">
		<a aria-hidden="true" class="linkable" href="[$loc.pathname][$loc.search][id|pre:%23]">[linkable|prune:*]#</a>
		<iframe loading="lazy" allowfullscreen frameborder="0" scrolling="no"></iframe>
	</element-embed>`,
	scripts: [
		'../ui/embed.js'
	],
	stylesheets: [
		'../ui/loading.css',
		'../ui/embed.css',
		'../ui/linkable.css'
	]
};
exports.editor.scripts.push('../ui/embed-helper.js');
