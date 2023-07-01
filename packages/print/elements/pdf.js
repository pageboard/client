
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
	bundle: 'pdf',
	context: 'pdf//',
	icon: '<i class="icon file outline"></i>',
	properties: {
		skip: {
			title: 'Skip page counter',
			type: 'boolean',
			default: false
		},
		background: {
			title: 'Background',
			type: 'object',
			nullable: true,
			properties: {
				color: {
					title: 'Color',
					type: 'string',
					format: 'hex-color',
					$helper: 'color'
				},
				top: {
					title: 'Top in %',
					type: 'number',
					minimum: 0,
					nullable: true
				},
				left: {
					title: 'Left in %',
					type: 'number',
					minimum: 0,
					nullable: true
				},
				width: {
					title: 'Width in %',
					type: 'number',
					minimum: 0,
					nullable: true
				},
				height: {
					title: 'Height in %',
					type: 'number',
					minimum: 0,
					nullable: true
				},
				bleedwidth: {
					title: 'Bleed width',
					type: 'boolean',
					default: false
				},
				bleedheight: {
					title: 'Bleed height',
					type: 'boolean',
					default: false
				},
			}
		}
	},
	contents: {
		id: "page",
		nodes: "block+"
	},
	upgrade: {
		'content.' : 'content.page'
	},
	html: `<div class="page-sheet [skip|alt:page-sheet-skip]" block-content="page"
		style---bleedwidth="[background.bleedwidth|alt:1:0]"
		style---bleedheight="[background.bleedheight|alt:1:0]"
		style---width="[background.width|post:%25|or:auto]"
		style---height="[background.height|post:%25|or:auto]"
		style---left="[background.left|post:%25|or:0]"
		style---top="[background.top|post:%25|or:0]"
		style---color="[background.color]"></div`
};

exports.sheetmatch = {
	title: 'Match',
	menu: "pdf",
	bundle: 'pdf',
	group: "block",
	context: "pdf//",
	icon: '<b class="icon">L/R</b>',
	properties: {
		match: {
			title: 'Match',
			type: 'array',
			nullable: true,
			default: ['left', 'right'],
			items: {
				anyOf: [{
					title: 'left pages',
					const: 'left'
				}, {
					title: 'right pages',
					const: 'right'
				}, {
					title: 'first page',
					const: 'first'
				}, {
					title: 'last page',
					const: 'last'
				}]
			}
		}
	},
	contents: "block+",
	html: '<div class="page-sheet-match" data-match="[match]"></div>',
	stylesheets: [
		"../ui/pdf.css"
	],
	scripts: [
		'../ui/pdf.js'
	]
};

exports.sheetcount = {
	title: 'Count',
	menu: "pdf",
	bundle: 'pdf',
	group: "block",
	context: "pdf//",
	icon: '<b class="icon">1/2</b>',
	properties: {
		separator: {
			title: 'Separator for total count',
			description: 'Set empty to hide total count',
			type: 'string',
			format: 'singleline',
			nullable: true
		}
	},
	html: '<div class="page-sheet-count" data-separator="[separator]"></div>',
	stylesheets: [
		"../ui/pdf.css"
	],
	scripts: [
		'../ui/pdf.js'
	]
};
