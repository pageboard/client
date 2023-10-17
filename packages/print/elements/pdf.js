
// extend page
exports.pdf = {
	...exports.page,
	title: 'PDF',
	icon: '<i class="icon file pdf outline"></i>',
	contents: [{
		id: 'title',
		nodes: 'text*'
	}, {
		id: 'body',
		nodes: 'block+'
	}],
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
	mime: "application/pdf",
	properties: {
		...exports.page.properties,
		url: {
			...exports.page.properties.url,
			pattern: /^(\/[a-zA-Z0-9-]*)+$/.source
		},
		paper: {
			title: 'Paper',
			type: 'object',
			nullable: true,
			properties: {
				width: {
					title: 'Width in mm',
					type: 'number',
					default: 210
				},
				height: {
					title: 'Height in mm',
					type: 'number',
					default: 297
				},
				margin: {
					title: 'Margins in mm',
					description: 'Margins do not change width/height',
					type: 'number',
					default: 10
				},
				spine: {
					title: 'Spine in mm',
					description: 'Augment odd pages width',
					type: 'number',
					default: 0
				},
				foldWidth: {
					title: 'Fold width',
					type: 'boolean',
					nullable: true
				},
				foldHeight: {
					title: 'Fold height',
					type: 'boolean',
					nullable: true
				},
				preset: {
					title: 'Preset',
					description: 'Default pdf export',
					anyOf: [{
						type: 'null',
						title: 'Screen'
					}, {
						const: 'ebook',
						title: 'Ebook'
					}, {
						const: 'printer',
						title: 'Printer'
					}]
				},
				counterOffset: {
					title: 'Sheet counter offset',
					type: 'integer',
					minimum: 0,
					nullable: true
				}
			}
		}
	},
	fragments: [
		...exports.page.fragments || [], {
			path: 'body',
			attributes: {
				"data-width": "[paper.width]",
				"data-height": "[paper.height]",
				"data-margin": "[paper.margin]",
				"data-preset": "[paper.preset]",
				"data-spine": "[paper.spine]",
				"data-fold-width": "[paper.foldWidth|alt:2:1]",
				"data-fold-height": "[paper.foldHeight|alt:2:1]",
				"data-counter-offset": "[paper.counterOffset]"
			}
		}
	]
};

exports.sheet = {
	title: 'Sheet',
	menu: "pdf",
	group: 'block',
	priority: 1, // after HTMLElementImage
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
					minimum: -100,
					maximum: 100,
					nullable: true
				},
				left: {
					title: 'Left in %',
					type: 'number',
					minimum: -100,
					maximum: 100,
					nullable: true
				},
				width: {
					title: 'Width in %',
					type: 'number',
					maximum: 100,
					minimum: 0,
					nullable: true
				},
				height: {
					title: 'Height in %',
					type: 'number',
					maximum: 100,
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
				image: {
					title: 'Image',
					anyOf: [{
						type: "null"
					}, {
						type: "string",
						format: "uri"
					}, {
						type: "string",
						format: "pathname"
					}],
					$helper: {
						name: 'href',
						filter: {
							type: ["image"]
						}
					}
				},
				repeat: {
					title: 'Repeat',
					anyOf: [{
						const: null,
						title: 'Repeat'
					}, {
						const: 'no-repeat',
						title: 'No Repeat'
					}, {
						const: 'repeat-x',
						title: 'Repeat X'
					}, {
						const: 'repeat-y',
						title: 'Repeat Y'
					}, {
						const: 'space',
						title: 'Space'
					}, {
						const: 'round',
						title: 'Round'
					}]
				},
				position: {
					title: 'Position',
					anyOf: [{
						const: null,
						title: 'Top Left'
					}, {
						const: 'top center',
						title: 'Top Center'
					}, {
						const: 'top right',
						title: 'Top Right'
					}, {
						const: 'center left',
						title: 'Center Left'
					}, {
						const: 'center',
						title: 'Center'
					}, {
						const: 'center right',
						title: 'Center Right'
					}, {
						const: 'bottom left',
						title: 'Bottom Left'
					}, {
						const: 'bottom center',
						title: 'Bottom Center'
					}, {
						const: 'bottom right',
						title: 'Bottom Right'
					}]
				},
				crop: {
					title: 'Crop and scale',
					type: "object",
					nullable: true,
					properties: {
						x: {
							type: "number",
							minimum: 0,
							maximum: 100,
							default: 50,
							title: "Horizontal center"
						},
						y: {
							type: "number",
							minimum: 0,
							maximum: 100,
							default: 50,
							title: "Vertical center"
						},
						width: {
							type: "number",
							minimum: 0,
							maximum: 100,
							default: 100,
							title: "Width"
						},
						height: {
							type: "number",
							minimum: 0,
							maximum: 100,
							default: 100,
							title: "Height"
						},
						zoom: {
							type: "number",
							minimum: 1,
							maximum: 100,
							default: 100,
							title: "Zoom"
						}
					},
					$helper: {
						name: 'crop'
					}
				}
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
		is="element-sheet" data-src="[background.image]"
		data-crop="[background.crop.x];[background.crop.y];[background.crop.width];[background.crop.height];[background.crop.zoom]"
		data-size-h="[background.width|post:%25]"
		data-size-v="[background.height|post:%25]"
		style---bleedwidth="[background.bleedwidth|alt:1:0]"
		style---bleedheight="[background.bleedheight|alt:1:0]"
		style---left="[background.left|post:%25]"
		style---top="[background.top|post:%25]"
		style---position="[background.position]"
		style---color="[background.color]"
		style---repeat="[background.repeat]"></div`,
	scripts: [
		'../ui/sheet.js'
	]
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
