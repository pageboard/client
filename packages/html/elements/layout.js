exports.layout = {
	title: "Layout",
	icon: '<i class="icon move"></i>',
	upgrade: {
		'data.invert': 'data.background.invert'
	},
	properties: {
		horizontal: {
			title: 'Horizontal',
			description: 'Position horizontally',
			default: "left",
			anyOf: [{
				const: "left",
				title: "Left"
			}, {
				const: "hcenter",
				title: "Center"
			}, {
				const: "hbetween",
				title: "Spaced between"
			}, {
				const: "haround",
				title: "Spaced around"
			}, {
				const: "right",
				title: "Right"
			}]
		},
		vertical: {
			title: 'Vertical',
			description: 'Position vertically',
			default: "top",
			anyOf: [{
				const: "top",
				title: "Top"
			}, {
				const: "vcenter",
				title: "Center"
			}, {
				const: "vstretch",
				title: "Stretch"
			}, {
				const: "vbaseline",
				title: "Baseline"
			}, {
				const: "bottom",
				title: "Bottom"
			}]
		},
		direction: {
			title: 'Direction',
			default: "column",
			anyOf: [{
				const: "column",
				title: "Column"
			}, {
				const: "row",
				title: "Row"
			}]
		},
		width: {
			title: 'Width',
			anyOf: [{
				type: "null",
				title: "None"
			}, {
				const: "full",
				title: "Full"
			}, {
				const: "contained",
				title: "Contained"
			}]
		},
		height: {
			title: 'Height',
			type: 'number',
			minimum: 0,
			default: 0
		},
		heightUnits: {
			title: 'Height units',
			default: 'em',
			anyOf: [{
				title: 'em',
				const: 'em'
			}, {
				title: 'rem',
				const: 'rem'
			}, {
				title: 'px',
				const: 'px'
			}, {
				title: 'vh',
				const: 'vh'
			}, {
				title: '%',
				const: '%'
			}]
		},
		margins: {
			title: 'Margins',
			type: 'object',
			nullable: true,
			properties: {
				inline: {
					title: 'Inline (em)',
					type: 'number',
					default: 0,
					multipleOf: 0.1,
					nullable: true
				},
				inlineUnits: {
					const: 'em'
				},
				block: {
					title: 'Block (rem)',
					type: 'number',
					default: 0,
					multipleOf: 0.1,
					nullable: true
				},
				blockUnits: {
					const: 'rem'
				}
			}
		},
		background: {
			title: 'Background',
			type: 'object',
			nullable: true,
			properties: {
				invert: {
					title: 'Invert',
					description: 'Invert background',
					default: false,
					type: 'boolean'
				},
				color: {
					title: 'Color',
					type: 'string',
					format: 'hex-color',
					$helper: 'color'
				},
				image: {
					title: 'Image',
					description: 'Local or remote URL',
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
				},
				size: {
					title: 'Size',
					anyOf: [{
						const: null,
						title: 'Auto'
					}, {
						const: 'cover',
						title: 'Cover'
					}, {
						const: 'contain',
						title: 'Contain'
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
				attachment: {
					title: 'Attachment',
					anyOf: [{
						const: null,
						title: 'Local'
					}, {
						const: 'scroll',
						title: 'Scroll'
					}, {
						const: 'fixed',
						title: 'Fixed'
					}]
				}
			}
		}
	},
	contents: "block+",
	group: 'block',
	html: `<div class="layout
		[width|switch:full:fullwidth:contained:ui container]
		[horizontal]
		[vertical]
		[direction]
		[background.invert|alt:inverted]"
		is="element-layout"
		style-margin-block="[margins.block|fail:][margins.blockUnits]"
		style-margin-inline="[margins.inline|fail:][margins.inlineUnits]"
		style-height="[height|fail:][heightUnits]"
		style-background-color="[background.color]"
		data-src="[background.image]"
		data-crop="[background.crop.x];[background.crop.y];[background.crop.width];[background.crop.height];[background.crop.zoom]"
		data-size="[background.size]"
		data-repeat="[background.repeat]"
		data-attachment="[background.attachment]"
		data-position="[background.position]"
	></div>`,
	stylesheets: [
		'../lib/components/container.css',
		'../ui/layout.css'
	],
	scripts: [
		'../ui/layout.js'
	]
};

