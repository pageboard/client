
// extend page
exports.pdf = {
	...exports.page,
	title: 'Print',
	icon: '<i class="icon file pdf outline"></i>',
	contents: [{
		id: 'title',
		nodes: 'text*'
	}, {
		id: 'body',
		nodes: 'block+'
	}],
	stylesheets: [
		exports.page.resources.reset,
		exports.page.resources.site,
		'../ui/pdf.css',
		'../ui/text-wrap.css'
	],
	scripts: [ ...exports.page.scripts,
		'../ui/pdf.js'
	],
	csp: {
		...exports.page.csp,
		style: ["'self'", "'unsafe-inline'", 'https:']
	},
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
					title: 'Width',
					description: 'Units: mm',
					type: 'number',
					default: 210
				},
				height: {
					title: 'Height',
					description: 'Units: mm',
					type: 'number',
					default: 297
				},
				margin: {
					title: 'Margins',
					description: 'Units: mm',
					type: 'number',
					default: 10
				},
				fold: {
					title: 'Fold',
					type: 'object',
					nullable: true,
					properties: {
						width: {
							title: 'Width',
							description: 'Units: mm',
							type: 'number',
							nullable: true
						}
					}
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
						const: 'prepress',
						title: 'Prepress'
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
				"is": "element-print",
				"data-width": "[paper.width]",
				"data-height": "[paper.height]",
				"data-margin": "[paper.margin]",
				"data-preset": "[paper.preset]",
				"data-fold-width": "[paper.fold?.width]",
				"data-counter-offset": "[paper.counterOffset]"
			}
		}
	]
};

exports.sheet = {
	title: 'Sheet',
	priority: 1, // after HTMLElementImage
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
					$helper: {
						name: 'color',
						alpha: true
					}
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
	html: `<div class="page-sheet [skip|alt:page-sheet-skip] [bleed?.left|and:bleed-left] [bleed?.right|and:bleed-right] [bleed?.top|and:bleed-top] [bleed?.bottom|and:bleed-bottom]" block-content="page"
		is="element-sheet" data-src="[background.image]"
		data-crop="[background.crop.x];[background.crop.y];[background.crop.width];[background.crop.height];[background.crop.zoom]"
		data-size-h="[background.width|post:%25]"
		data-size-v="[background.height|post:%25]"
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
	// title: 'Match', // deprecated, use layout side
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
	html: '<div class="[match|map:pre:page-match-|join: ]"></div>',
	stylesheets: [
		"../ui/pdf.css"
	],
	scripts: [
		'../ui/pdf.js'
	]
};

exports.layout.properties.side = {
	title: 'Side',
	anyOf: [{
		title: 'Both',
		type: 'null'
	}, {
		title: 'Left',
		const: 'left'
	}, {
		title: 'Right',
		const: 'right'
	}]
};
exports.layout.fragments.push({
	attributes: {
		className: "[side|pre:page-match-]"
	}
});

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

exports.numbering = {
	title: 'Numbering',
	menu: "pdf",
	bundle: 'pdf',
	group: "inline",
	inline: true,
	inplace: true,
	context: "pdf//",
	icon: '<b class="icon">n/N</b>',
	properties: {
		separator: {
			title: 'Separator for total count',
			description: 'Set empty to hide total count',
			type: 'string',
			format: 'singleline',
			nullable: true
		}
	},
	parse: function (dom) {
		return { separator: dom.dataset.separator };
	},
	tag: 'span.page-sheet-count',
	html: '<span class="page-sheet-count" data-separator="[separator]"></span>',
	stylesheets: [
		"../ui/pdf.css"
	],
	scripts: [
		'../ui/pdf.js'
	]
};


exports.layout.properties.bleed = exports.sheet.properties.bleed = {
	title: 'Bleed',
	description: 'bleeds content\nif background is transparent',
	type: 'object',
	nullable: true,
	properties: {
		left: {
			title: 'Left',
			type: 'boolean',
			default: false
		},
		right: {
			title: 'Right',
			type: 'boolean',
			default: false
		},
		top: {
			title: 'Top',
			type: 'boolean',
			default: false
		},
		bottom: {
			title: 'Bottom',
			type: 'boolean',
			default: false
		}
	}
};
exports.layout.properties.background.properties.crop = exports.sheet.properties.background.properties.crop;


exports.layout.fragments.push({
	attributes: {
		className: "[bleed?.left|and:bleed-left] [bleed?.right|and:bleed-right] [bleed?.top|and:bleed-top] [bleed?.bottom|and:bleed-bottom]",
		"style---colored": "[background.color|alt:1:0]"
	}
});

exports.layout.stylesheets.push('../ui/layout.css');
