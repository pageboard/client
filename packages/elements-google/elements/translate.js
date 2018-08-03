Pageboard.elements.google_translate = {
	title: 'Translate',
	icon: '<i class="google icon"></i>',
	group: 'menu_item',
	context: "menu/",
	menu: 'link',
	contents: {
		title: "inline*"
	},
	html: '<element-google-translate class="item" block-content="title">Translate</element-google-translate>',
	scripts: [
		'../ui/translate.js'
	],
	stylesheets: [
		'../ui/translate.css'
	]
};
