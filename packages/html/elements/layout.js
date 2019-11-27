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
		style-height="[height|eq:0:|not|magnet][heightUnits]"
		style-background-image="url([background.image|magnet])"
		style-background-size="[background.size]"
		style-background-repeat="[background.repeat|?]"
		style-background-attachment="[background.attachment]"
		style-background-position="[background.position]"
	></div>`,
	fuse: function(node, d, scope) {
		node.fuse(d, scope);
		Array.from(node.attributes).forEach(attr => {
			if (!attr.name.startsWith('style-')) return;
			var style = attr.name.split('-').slice(1).map((w, i) => {
				if (i > 0) w = w[0].toUpperCase() + w.substr(1);
				return w;
			}).join("");
			node.style[style] = attr.value;
			node.removeAttribute(attr.name);
		});
	},
	stylesheets: [
		'../lib/components/container.css',
		'../ui/layout.css'
	]
};

