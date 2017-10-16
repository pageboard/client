Pageboard.elements.gallery = {
	title: "Gallery",
	properties: {
		showMenu: {
			type: 'boolean',
			default: true,
			title: 'Show menu'
		}
	},
	contents: {
		galleries: {
			spec: "(portfolio carousel medialist)|(portfolio carousel)|(portfolio medialist)|(carousel medialist)"
		}
	},
	group: 'block',
	icon: '<i class="university icon"></i>',
	render: function(doc, block, view) {
		var d = block.data;
		return doc.dom`<element-gallery data-show-menu="${d.showMenu}">
			<div block-content="galleries"></div>
		</element-gallery>`;
	},
	stylesheets: [
		'../ui/gallery.css'
	],
	scripts: [
		'../ui/gallery.js'
	],
	helpers: [
		'../ui/dift.js',
		'../ui/gallery-helper.js'
	]
};

