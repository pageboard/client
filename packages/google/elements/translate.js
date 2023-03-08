exports.google_translate = {
	priority: 12,
	title: 'Translate',
	icon: '<i class="google icon"></i>',
	group: 'menu_item',
	context: "menu/",
	menu: 'link',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<element-google-translate class="item">Translate</element-google-translate>',
	scripts: [
		'../ui/translate.js'
	],
	csp: {
		script: [
			"[$commons.csp.script.google_translate]"
		],
		style: [
			"[$commons.csp.style.google_translate]"
		],
		connect: [
			"[$commons.csp.connect.google_translate]"
		]
	},
	stylesheets: [
		'../ui/translate.css'
	]
};


