Pageboard.elements.header = {
	title: "Header",
	group: "section",
	properties: {
		collapsed: {
			title: "Collapsed",
			description: "Collapse to zero height",
			default: false,
			type: "boolean"
		}
	},
	contents: {
		content: {
			spec: "block+"
		}
	},
	icon: '<b class="icon">Head</b>',
	context: 'page/',
	tag: "header,element-sticky.header",
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<element-sticky class="header" data-collapsed="${d.collapsed}">
			<header block-content="content"></header>
		</element-sticky>`;
	},
	stylesheets: [
		'../ui/sticky.css',
		'../ui/layout.css'
	],
	scripts: [
		'../lib/stickybits.js',
		'../ui/sticky.js'
	]
};

Pageboard.elements.main = {
	title: "Main",
	group: "section",
	properties: {},
	contents: {
		content: {
			spec: "block+"
		}
	},
	icon: '<b class="icon">Main</b>',
	context: 'page/',
	tag: "main",
	render: function(doc, block) {
		return doc.dom`<main block-content="content"></main>`;
	},
	stylesheets: [
		'../ui/layout.css'
	]
};

Pageboard.elements.footer = {
	title: "Footer",
	group: "section",
	properties: {},
	contents: {
		content: {
			spec: "block+"
		}
	},
	icon: '<b class="icon">Main</b>',
	context: 'page/',
	tag: "footer",
	render: function(doc, block) {
		return doc.dom`<footer block-content="content"></footer>`;
	},
	stylesheets: [
		'../ui/layout.css'
	]
};

