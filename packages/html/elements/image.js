exports.image = {
	title: "Image",
	priority: -1,
	menu: 'media',
	icon: '<i class="icon image"></i>',
	properties: {
		url: {
			title: 'Address',
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
			},
			$file: {
				size: 50000000,
				types: ["image/*"]
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
	contents: [{
		id: 'legend',
		title: 'legend',
		nodes: "inline*"
	}, {
		id: 'alt',
		title: 'Alternative Text',
		name: 'data-alt',
		$helper: {
			name: 'describe'
		}
	}],
	html: `<element-image
		class="[display.fit|or:none] [display.horizontal?] [display.vertical?]"
		data-src="[url]"
		data-crop="[crop.x|or:50];[crop.y|or:50];[crop.width|or:100];[crop.height|or:100];[crop.zoom|or:100]"
	>
		<div block-content="legend"></div>
	</element-image>`,
	stylesheets: [
		'../ui/loading.css',
		'../ui/image.css'
	],
	scripts: [
		'../ui/image.js'
	]
};

exports.inlineImage = {
	title: "Icon",
	priority: 12,
	icon: '<i class="icon image"></i>',
	properties: {
		url: {
			title: 'Address',
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
				display: 'icon',
				filter: {
					type: ["image"],
					maxSize: 20000,
					maxWidth: 320,
					maxHeight: 320
				}
			},
			$file: {
				size: 200000,
				types: ["image/*"]
			}
		},
		display: {
			title: 'Display options',
			type: 'object',
			nullable: true,
			properties: {
				avatar: {
					title: 'avatar',
					type: 'boolean',
					default: false
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
					}],
					default: ""
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
		data-src="[url]"
		data-crop="[crop.x];[crop.y];[crop.width];[crop.height];[crop.zoom]"
		alt="" class="ui inline image
		[display.avatar]
		[display.rounded]
		[display.circular]
		[display.spaced]
		[display.floated|pre:floated ]
		[display.align|post: aligned]" />`,
	stylesheets: [
		'../ui/components/image.css'
	],
	polyfills: [
		'IntersectionObserver'
	]
};

