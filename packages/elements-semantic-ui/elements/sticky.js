Pageboard.elements.sticky = {
	title: "Sticky",
	group: "block",
	properties: {
		position: {
			title: "Position",
			default: "top",
			oneOf: [{
				constant: "top",
				title: "top"
			}, {
				constant: "bottom",
				title: "bottom"
			}]
		}
	},
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	icon: '<i class="icon pin"></i>',
	render: function(doc, block) {
		return doc.dom`<element-sticky block-content="content" class="${block.data.position} sticky"></element-sticky>`;
	},
	stylesheets: [
		'../ui/sticky-state.css',
		'../ui/element-sticky.css'
	],
	scripts: [
		'../ui/sticky-state.min.js', // min version
		'../ui/element-sticky.js'
	]
};

