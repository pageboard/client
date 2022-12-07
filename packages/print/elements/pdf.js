
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
	csp: {
		...exports.page.csp,
		style: ["'self'", "'unsafe-inline'", 'https:']
	},
	mime: "application/pdf"
};
exports.pdf.fragments = [
	...exports.pdf.fragments || [], {
		path: 'body',
		attributes: {
			"data-width": "[paper.width]",
			"data-height": "[paper.height]",
			"data-margin": "[paper.margin]",
			"data-preset": "[paper.preset]"
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
		nullable: true,
		properties: {
			width: {
				title: 'Width',
				type: 'string',
				format: 'singleline',
				default: '210mm'
			},
			height: {
				title: 'Height',
				type: 'string',
				format: 'singleline',
				default: '297mm'
			},
			margin: {
				title: 'Margin',
				type: 'string',
				format: 'singleline',
				default: '10mm'
			},
			preset: {
				title: 'Preset',
				description: 'Default pdf export',
				anyOf: [{
					type: 'null',
					title: 'Printer'
				}, {
					const: 'ebook',
					title: 'Ebook'
				}, {
					const: 'screen',
					title: 'Screen'
				}]
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
