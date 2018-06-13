Pageboard.elements.google_translate = {
	title: 'Translate',
	group: 'menu_item',
	context: "menu/",
	menu: 'link',
	icon: '<i class="google icon"></i>',
	contents: {
		title: "inline*"
	},
	render: function(doc, block) {
		return doc.dom`<element-google-translate class="item" block-content="title">Translate</element-google-translate>`;
	},
	scripts: [
		'../ui/translate.js'
	],
	stylesheets: [
		'../ui/translate.css'
	]
};
