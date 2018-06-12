Pageboard.elements.google_translate = {
	title: 'Translate',
	group: 'menu_item',
	context: "menu/",
	menu: 'link',
	icon: '<i class="google icon"></i>',
	properties: {
		banner: {
			title: 'Automatic banner',
			type: 'boolean',
			default: false
		},
		opened: {
			title: 'Keep opened',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		title: "inline*"
	},
	render: function(doc, block) {
		var node = doc.dom`<element-google-translate class="item">
			<div block-content="title">Google Translate</div>
		</element-google-translate>`;
		Object.assign(node.dataset, block.data);
		return node;
	},
	scripts: [
		'../ui/translate.js'
	],
	stylesheets: [
		'../ui/translate.css'
	]
};
