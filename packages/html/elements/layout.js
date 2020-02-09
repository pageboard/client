exports.layout = {
	title: "Layout",
	icon: '<i class="icon move"></i>',
	properties: {
		horizontal: {
			title: 'horizontal',
			description: 'Position horizontally',
			default: "left",
			anyOf: [{
				const: "left",
				title: "left"
			}, {
				const: "hcenter",
				title: "center"
			}, {
				const: "hbetween",
				title: "spaced between"
			}, {
				const: "haround",
				title: "spaced around"
			}, {
				const: "right",
				title: "right"
			}]
		},
		vertical: {
			title: 'vertical',
			description: 'Position vertically',
			default: "top",
			anyOf: [{
				const: "top",
				title: "top"
			}, {
				const: "vcenter",
				title: "center"
			}, {
				const: "vstretch",
				title: "stretch"
			}, {
				const: "vbaseline",
				title: "baseline"
			}, {
				const: "bottom",
				title: "bottom"
			}]
		},
		direction: {
			title: 'direction',
			default: "column",
			anyOf: [{
				const: "column",
				title: "column"
			}, {
				const: "row",
				title: "row"
			}]
		},
		width: {
			title: 'width',
			default: "full",
			anyOf: [{
				const: "full",
				title: "full"
			}, {
				const: "contained",
				title: "contained"
			}]
		},
		height: {
			title: 'height',
			type: 'number',
			minimum: 0,
			default: 0
		},
		heightUnits: {
			title: 'height units',
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
		invert: {
			title: 'invert',
			description: 'Invert background',
			default: false,
			type: 'boolean'
		},
		background: {
			title: 'Background',
			type: 'object',
			nullable: true,
			properties: {
				image: {
					title: 'Image',
					description: 'Local or remote URL',
					nullable: true,
					anyOf: [{
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
						type: 'null',
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
						type: 'null',
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
						type: 'null',
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
						type: 'null',
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
		[width|eq:full:fullwidth:]
		[width|eq:contained:ui container:]
		[horizontal|?]
		[vertical|?]
		[direction]
		[invert|?:inverted]"
		is="element-layout"
		style-height="[height|eq:0:|not|magnet][heightUnits]"
		data-src="[background.image]"
		data-size="[background.size]"
		data-repeat="[background.repeat|?]"
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

