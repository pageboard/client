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
		title: exports.blog.properties.title,
		thumbnail: exports.blog.properties.thumbnail,
		description: exports.blog.properties.description
	},
	html: `<element-social data-networks="[networks]" data-title="[title]" data-image="[thumbnail]" data-description="[description]"></element-social>`,
	scripts: ['../ui/social.js'],
	stylesheets: ['../ui/social.css']
};
