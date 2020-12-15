exports.share = {
	title: 'Share',
	menu: "widget",
	inline: true,
	group: "inline",
	contents: "inlineImage",
	context: "blog//",
	icon: '<i class="share alternate icon"></i>',
	properties: {
		network: {
			title: 'Network',
			anyOf: [{
				const: "facebook",
				title: 'Facebook'
			}, {
				const: "twitter",
				title: 'Twitter'
			}, {
				const: "linkedin",
				title: 'LinkedIn'
			}, {
				const: "pinterest",
				title: 'Pinterest'
			}]
		}
	},
	html: `<a is="element-share" data-network="[network]"></a>`,
	scripts: ['../ui/share.js']
};
