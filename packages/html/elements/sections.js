Pageboard.elements.header = {
	title: "Header",
	icon: '<b class="icon">Head</b>',
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
		id: "content",
		nodes: "block+"
	},
	context: 'page/',
	tag: "header,element-sticky.header",
	html: `<element-sticky class="header" data-collapsed="[collapsed|magnet]">
		<header block-content="content"></header>
	</element-sticky>`,
	stylesheets: [
		'../ui/sticky.css',
		'../ui/layout.css'
	],
	scripts: [
		'../ui/stickyfill.js',
		'../ui/sticky.js'
	]
};

Pageboard.elements.main = {
	title: "Main",
	icon: '<b class="icon">Main</b>',
	group: "section",
	contents: "block+",
	context: 'page/',
	tag: "main",
	html: '<main></main>',
	stylesheets: [
		'../ui/layout.css'
	]
};

Pageboard.elements.footer = {
	title: "Footer",
	icon: '<b class="icon">Main</b>',
	group: "section",
	contents: "block+",
	context: 'page/',
	tag: "footer",
	html: '<footer></footer>',
	stylesheets: [
		'../ui/layout.css'
	]
};

