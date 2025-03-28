exports.units = {
	properties: {
		inline: {
			title: 'Inline units',
			anyOf: [
				{ const: 'em' },
				{ const: 'ch' },
				{ const: 'vw' },
				{ const: 'rem' },
				{ const: 'px' },
				{ const: '%' }
			],
			default: 'em',
			$helper: 'units'
		},
		block: {
			title: 'Block units',
			anyOf: [
				{ const: 'rem' },
				{ const: 'ex' },
				{ const: 'vh' },
				{ const: '%' },
				{ const: 'em' },
				{ const: 'px' }
			],
			default: 'rem',
			$helper: 'units'
		}
	}
};

exports.layout = {
	title: "Layout",
	icon: '<i class="icon move"></i>',
	properties: {
		horizontal: {
			title: 'Horizontal',
			description: 'Inline disposition',
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
			description: 'Block disposition',
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
		wrap: {
			title: 'Wrap',
			anyOf: [{
				const: null,
				title: 'No wrap'
			}, {
				const: 'wrap',
				title: 'Wrap'
			}, {
				const: 'wrap-reverse',
				title: 'Reverse'
			}]
		},
		width: {
			title: 'Width',
			anyOf: [{
				const: null,
				title: "None"
			}, {
				const: "full",
				title: "Full"
			}, {
				const: "contained",
				title: "Contained"
			}]
		},
		maxWidth: {
			title: 'Max width',
			type: 'number',
			minimum: 0,
			nullable: true
		},
		maxWidthUnits: {
			$ref: "#/definitions/units/properties/data/properties/inline"
		},
		height: {
			title: 'Height',
			type: 'number',
			minimum: 0,
			default: 0
		},
		heightUnits: {
			$ref: "#/definitions/units/properties/data/properties/block"
		},
		column: {
			title: 'Column',
			nullable: true,
			properties: {
				count: {
					title: 'Count',
					description: 'empty for auto',
					type: 'integer',
					nullable: true,
					minimum: 1
				},
				width: {
					title: 'Width',
					properties: {
						length: {
							title: 'Length',
							type: 'number',
							default: 0,
							minimum: 0,
							multipleOf: 0.01,
							nullable: true
						},
						unit: {
							$ref: "#/definitions/units/properties/data/properties/inline"
						}
					}
				},
				fill: {
					title: 'Fill',
					anyOf: [{
						const: null,
						title: 'Auto'
					}, {
						const: 'balance',
						title: 'Balance'
					}, {
						const: 'balance-all',
						title: 'Balance All'
					}]
				},
				gap: {
					title: 'Gap',
					properties: {
						length: {
							title: 'Length',
							type: 'number',
							default: 0,
							minimum: 0,
							multipleOf: 0.01,
							nullable: true
						},
						unit: {
							$ref: "#/definitions/units/properties/data/properties/inline"
						}
					}
				}
			}
		},
		margins: {
			title: 'Margins',
			type: 'object',
			nullable: true,
			properties: {
				inline: {
					title: 'Inline',
					type: 'number',
					default: 0,
					multipleOf: 0.01,
					nullable: true
				},
				inlineUnits: {
					$ref: "#/definitions/units/properties/data/properties/inline"
				},
				block: {
					title: 'Block',
					type: 'number',
					default: 0,
					multipleOf: 0.01,
					nullable: true
				},
				blockUnits: {
					$ref: "#/definitions/units/properties/data/properties/block"
				}
			}
		},
		padding: {
			title: 'Padding',
			type: 'object',
			nullable: true,
			properties: {
				inline: {
					title: 'Inline',
					type: 'number',
					default: 0,
					minimum: 0,
					multipleOf: 0.01,
					nullable: true
				},
				inlineUnits: {
					$ref: "#/definitions/units/properties/data/properties/inline"
				},
				block: {
					title: 'Block',
					type: 'number',
					default: 0,
					minimum: 0,
					multipleOf: 0.01,
					nullable: true
				},
				blockUnits: {
					$ref: "#/definitions/units/properties/data/properties/block"
				}
			}
		},
		overlay: {
			title: 'Overlay',
			nullable: true,
			properties: {
				inline: {
					title: 'Inline',
					anyOf: [{ const: 'start', title: 'Start' }, { const: 'end', title: 'End' }]
				},
				block: {
					title: 'Block',
					anyOf: [{ const: 'start', title: 'Start' }, { const: 'end', title: 'End' }]
				}
			}
		},
		background: {
			title: 'Background',
			type: 'object',
			nullable: true,
			properties: {
				invert: {
					title: 'Toggle inverted theme',
					default: false,
					type: 'boolean'
				},
				color: {
					title: 'Color',
					type: 'string',
					format: 'hex-color',
					$helper: {
						name: 'color',
						alpha: true
					}
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
		[overlay.block|pre:overlay block-] [overlay.inline|pre:overlay inline-]
		[width|switch:full:fullwidth:contained:ui container]
		[horizontal]
		[vertical]
		[wrap]
		[direction]
		[background.invert|alt:inverted]"
		is="element-layout"
		data-src="[background.image]"
		data-crop="[background.crop.x];[background.crop.y];[background.crop.width];[background.crop.height];[background.crop.zoom]"
		style-margin-block="[margins.block|fail:][margins.blockUnits]"
		style-margin-inline="[margins.inline|fail:][margins.inlineUnits]"
		style-padding-block="[padding.block|fail:][padding.blockUnits]"
		style-padding-inline="[padding.inline|fail:][padding.inlineUnits]"
		style-max-width="[maxWidth|fail:][maxWidthUnits]"
		style-height="[height|fail:][heightUnits]"
		style-background-color="[background.color]"
		style-background-size="[background.size]"
		style-background-repeat="[background.repeat]"
		style-background-attachment="[background.attachment]"
		style-background-position="[background.position]"
		style-column-gap="[column.gap.length|fail:][column.gap.unit]"
		style-column-fill="[column.fill|or:auto]"
		style-column-count="[column.count|or:auto]"
		style-column-width="[column.width.length|fail:][column.width.unit]"
	></div>`,
	stylesheets: [
		'../ui/components/container.css',
		'../ui/layout.css'
	],
	scripts: [
		'../ui/layout.js'
	]
};
