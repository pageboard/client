exports.google_translate = {
	priority: 12,
	description: 'deprecated',
	icon: '<i class="google icon"></i>',
	group: 'menu_item',
	context: "menu/",
	menu: 'link',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<div class="item">Deprecated</div>'
};
