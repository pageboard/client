exports.social = {
	title: 'Social',
	priority: 5,
	menu: "widget",
	group: 'block',
	bundle: 'blog',
	icon: '<i class="share alternate icon"></i>',
	properties: {
		networks: {
			title: 'Networks',
			type: 'array',
			nullable: true,
			items: {
				anyOf: [{
					const: "facebook",
					title: 'Facebook'
				}, {
					const: "twitter",
					title: 'Twitter'
				}, {
					const: "linkedin",
					title: 'LinkedIn'
				}]
			}
		},
		thumbnail: exports.blog.properties.thumbnail,
		description: exports.blog.properties.description
	},
	html: `<element-social data-networks="[networks]" data-thumbnail="[thumbnail]" data-description="[description]"></element-social>`,
	fragments: [{
		type: 'doc',
		path: 'html > head > meta',
		position: 'afterend',
		html: `<meta property="og:image" content="">`
	}],
	scripts: ['../ui/social.js'],
	stylesheets: ['../ui/social.css']
};
