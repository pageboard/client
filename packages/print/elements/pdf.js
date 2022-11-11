
// extend page
exports.pdf = {
	...exports.page,
	title: 'PDF',
	icon: '<i class="icon file pdf outline"></i>',
	contents: {
		id: 'body',
		nodes: 'block+'
	},
	stylesheets: [ ...exports.page.stylesheets.slice(0, 2),
		'../ui/pdf.css'
	],
	scripts: [ ...exports.page.scripts,
		'../ui/pdf.js'
	],
	output: {
		pdf: true
	}
};
exports.pdf.fragments = [
	...exports.pdf.fragments || [], {
		path: 'body',
		attributes: {
			"data-width": "[paper.width]",
			"data-height": "[paper.height]",
			"data-margin": "[paper.margin]"
		}
	}
];

exports.pdf.properties = {
	...exports.pdf.properties,
	url: {
		...exports.pdf.properties.url,
		pattern: /^(\/[a-zA-Z0-9-]*)+$/.source
	},
	paper: {
		title: 'Paper',
		type: 'object',
		properties: {
			width: {
				title: 'Width',
				type: 'string',
				default: '210mm'
			},
			height: {
				title: 'Height',
				type: 'string',
				default: '297mm'
			},
			margin: {
				title: 'Margin',
				type: 'string',
				default: '10mm'
			}
		}
	}
};

if (exports.sitemap) exports.sitepdf = exports.sitemap.itemModel('pdf', true);

exports.sheet = {
	title: 'Sheet',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon file outline"></i>',
	contents: {
		id: "page",
		nodes: "block+"
	},
	upgrade: {
		'content.' : 'content.page'
	},
	html: '<div class="page-sheet" block-content="page"></div>'
};
