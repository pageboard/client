exports.image = {
	title: "Image",
	menu: 'media',
	icon: '<i class="icon image"></i>',
	properties: {
		alt: {
			title: 'Alternative text',
			description: 'Short contextual description. Leave empty when used in links.',
			type: "string"
		},
		url: {
			title: 'Address',
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
		display: {
			title: "Display",
			type: "object",
			properties: {
				fit: {
					title: "Fit",
					default: "contain",
					anyOf: [{
						title: "contain",
						const: "contain"
					}, {
						title: "cover",
						const: "cover"
					}, {
						title: "natural",
						const: "none"
					}]
				},
				horizontal: {
					title: "Horizontal",
					default: "hcenter",
					anyOf: [{
						const: "left",
						title: "left"
					}, {
						const: "hcenter",
						title: "center"
					}, {
						const: "right",
						title: "right"
					}]
				},
				vertical: {
					title: "Vertical",
					default: "top",
					anyOf: [{
						const: "top",
						title: "top"
					}, {
						const: "vcenter",
						title: "center"
					}, {
						const: "bottom",
						title: "bottom"
					}]
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
		}
	},
	group: "block media",
	tag: 'element-image',
	contents: {
		id: 'legend',
		title: 'legend',
		nodes: "inline*"
	},
	html: `<element-image
		class="[display.fit|or:none] [display.horizontal|or:] [display.vertical|or:]"
		alt="[alt]"
		data-src="[url|or:[$element.resources.empty]]"
		data-crop="[crop.x];[crop.y];[crop.width];[crop.height];[crop.zoom]"
	>
		<div block-content="legend"></div>
	</element-image>`,
	resources: {
		empty: '../ui/empty.png'
	},
	stylesheets: [
		'../ui/loading.css',
		'../ui/image.css'
	],
	scripts: [
		'../lib/object-fit-images.js',
		'../ui/image.js'
	]
};

exports.inlineImage = {
	priority: 12,
	title: "Icon",
	icon: '<i class="icon image"></i>',
	properties: {
		url: {
			title: 'Address',
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
				display: 'icon',
				filter: {
					type: ["image"],
					maxSize: 20000,
					maxWidth: 320,
					maxHeight: 320
				}
			}
		},
		display: {
			title: 'Display options',
			type: 'object',
			properties: {
				avatar: {
					title: 'avatar',
					type: 'boolean',
					default: true
				},
				rounded: {
					title: 'rounded',
					type: 'boolean',
					default: false
				},
				circular: {
					title: 'circular',
					type: 'boolean',
					default: false
				},
				spaced: {
					title: 'spaced',
					type: 'boolean',
					default: false
				},
				floated: {
					title: 'floated',
					anyOf: [{
						const: "",
						title: "no"
					}, {
						const: "left",
						title: "left"
					}, {
						const: "right",
						title: "right"
					}]
				},
				align: {
					title: 'align',
					anyOf: [{
						const: "",
						title: "middle"
					}, {
						const: "top",
						title: "top"
					}, {
						const: "bottom",
						title: "bottom"
					}],
					default: ""
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
		}
	},
	inline: true,
	group: "inline",
	tag: "img",
	html: `<img is="element-img"
		data-src="[url|or:[$element.resources.empty]]"
		data-crop="[crop.x];[crop.y];[crop.width];[crop.height];[crop.zoom]"
		alt="" class="ui inline image
		[display.avatar|?]
		[display.rounded|?]
		[display.circular|?]
		[display.spaced|?]
		[display.floated|pre:floated ]
		[display.align|post: aligned]" />`,
	resources: {
		empty: '../ui/empty.png'
	},
	stylesheets: [
		'../lib/components/image.css'
	],
	polyfills: [
		'IntersectionObserver'
	]
};

