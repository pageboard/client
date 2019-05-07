exports.sticky = {
	title: "Sticky",
	icon: '<i class="icon pin"></i>',
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
	html: '<element-sticky block-content="content" data-collapsed="[collapsed|magnet]" data-position="[position]"></element-sticky>',
	stylesheets: [
		'../ui/sticky.css'
	],
	scripts: [
		'../ui/stickyfill.js',
		'../ui/sticky.js'
	]
};

