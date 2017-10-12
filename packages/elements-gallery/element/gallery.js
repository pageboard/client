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
		lists: {
			spec: "(medialist | portfolio | carousel)+",
			title: 'lists'
		}
	},
	group: 'block',
	icon: '<i class="university icon"></i>',
	render: function(doc, block, view) {
		var d = block.data;
		return doc.dom`<element-gallery data-show-menu="${d.showMenu}">
			<div block-content="lists"></div>
		</element-gallery>`;
	},
	stylesheets: [
		'../ui/gallery.css'
	],
	scripts: [
		'../ui/gallery.js'
	]
};

