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
			"https://translate.googleapis.com",
			"https://translate.google.com",
			"[$commons.csp.google_translate]"
		],
		style: ["https://translate.googleapis.com"],
		img: ["https://translate.googleapis.com", "https://www.gstatic.com", "https://www.google.com"],
		connect: ["https://translate.googleapis.com"]
	},
	stylesheets: [
		'../ui/translate.css'
	]
};
