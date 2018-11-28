Pageboard.elements.sticky = {
	title: "Sticky",
	menu: "widget",
	group: "block",
	properties: {
		position: {
			title: "Position",
			default: "top",
			anyOf: [{
				const: "top",
				title: "top"
			}, {
				const: "bottom",
				title: "bottom"
			}]
		},
		collapsed: {
			title: "Collapsed",
			description: "Collapse to zero height",
			default: false,
			type: "boolean"
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
		return doc.dom`<element-sticky block-content="content" data-collapsed="${block.data.collapsed}" data-position="${block.data.position}"></element-sticky>`;
	},
	stylesheets: [
		'../ui/sticky.css'
	],
	scripts: [
		'../lib/stickyfill.js',
		'../ui/sticky.js'
	]
};

