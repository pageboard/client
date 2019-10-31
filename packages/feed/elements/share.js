exports.share = {
	title: 'Share',
	menu: "widget",
	inline: true,
	group: "inline",
	icon: '<i class="share alternate icon"></i>',
	html: `<element-share></element-share>`,
	scripts: [
		'../ui/share.js'
	],
	stylesheets: [
		'../ui/share.css'
	]
};
