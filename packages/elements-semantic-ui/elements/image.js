Pageboard.elements.image = {
	title: "Image",
	properties: {
		alt: {
			title: 'Alternative text',
			description: 'Short contextual description. Leave empty when used in links.',
			type: "string"
		},
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			oneOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
				name: 'href',
				filter: {
					type: ["image", "svg"]
				}
			}
		},
		display: {
			title: "Display",
			type: "object",
			description: "A natural fit cannot be positioned",
			properties: {
				fit: {
					oneOf: [{
						title: "natural",
						const: "none"
					}, {
						title: "contain",
						const: "contain"
					}, {
						title: "cover",
						const: "cover"
					}],
					title: "fit",
					default: "contain"
				},
				horizontal: {
					title: "horizontal",
					oneOf: [{
						const: "left",
						title: "left"
					}, {
						const: "hcenter",
						title: "center"
					}, {
						const: "right",
						title: "right"
					}],
					default: "hcenter"
				},
				vertical: {
					title: "vertical",
					oneOf: [{
						const: "top",
						title: "top"
					}, {
						const: "vcenter",
						title: "center"
					}, {
						const: "bottom",
						title: "bottom"
					}],
					default: "vcenter"
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
			input: {
				name: 'crop'
			}
		}
	},
	group: "block",
	icon: '<i class="icon image"></i>',
	tag: 'element-image',
	buildUrl: function(url, d) {
		var loc = Page.parse(url);
		if (loc.hostname && loc.hostname != document.location.hostname) {
			loc = {
				pathname: "/.api/image",
				query: {
					url: d.url
				}
			};
		}
		var r = d.crop || {};
		var zoom = r.zoom || 100;
		if (r.x != 50 || r.y != 50 || r.width != 100 || r.height != 100 || r.zoom != 100) {
			if (r.x - r.width / 2 < 0 || r.x + r.width / 2 > 100) {
				r.width = 2 * Math.min(r.x, 100 - r.x);
			}
			if (r.y - r.height / 2 < 0 || r.y + r.height / 2 > 100) {
				r.height = 2 * Math.min(r.y, 100 - r.y);
			}
			loc.query.ex = `x:${r.x},y:${r.y},w:${r.width},h:${r.height}`;
		}
		return Page.format(loc);
	},
	render: function(doc, block) {
		var d = block.data;
		var url = this.buildUrl(d.url || '/.files/@pageboard/elements/ui/placeholder.png', d);

		var img = doc.dom`<img src="${url}" alt="${d.alt || ''}" />`;
		var node = doc.dom`<element-image>
			${img}
		</element-image>`;

		if (d.roi) {
			// legacy property
			d.display = d.roi;
			delete d.roi;
		}
		var display = d.display;
		if (display) {
			node.dataset.fit = display.fit || "none";
			var posx = display.horizontal;
			if (posx == "hcenter") posx = "center";
			var posy = display.vertical;
			if (posy == "vcenter") posy = "center";
			node.dataset.position = `${posx || 'center'} ${posy || 'center'}`;
		}
		if (node.dataset.fit != "none") {
			var loc = Page.parse(url);
			var zoom = (d.crop || {}).zoom || 100;
			img.setAttribute('srcset', [160, 320, 640, 1280].map(function(w) {
				loc.query.rs = `w:${Math.round(w * zoom / 100)}`;
				return `${Page.format(loc)} ${w}w`;
			}).join(", "));
		}
		return node;
	},
	stylesheets: [
		'../ui/image.css'
	],
	scripts: [
		'../ui/lib/object-fit-images.js',
		'../ui/image.js'
	]
};

Pageboard.elements.inlineImage = {
	title: "Icon",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			oneOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
				name: 'href',
				display: 'icon',
				filter: {
					type: ["image", "svg"],
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
					oneOf: [{
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
					oneOf: [{
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
			input: {
				name: 'crop'
			}
		}
	},
	inline: true,
	group: "inline",
	tag: "img",
	icon: '<i class="icon image"></i>',
	render: function(doc, block) {
		var d = block.data;
		var url = Pageboard.elements.image.buildUrl(
			d.url || '/.files/@pageboard/elements/ui/placeholder.png', d
		);
		var node = doc.dom`<img src="${url}" alt="" class="ui image" />`;
		var display = d.display || {};
		if (display.avatar) node.classList.add('avatar');
		if (display.rounded) node.classList.add('rounded');
		if (display.circular) node.classList.add('circular');
		if (display.spaced) node.classList.add('spaced');
		if (display.floated) {
			node.classList.add('floated', display.floated);
		}
		if (display.align) {
			node.classList.add(display.align, 'aligned');
		}
		return node;
	},
	stylesheets: [
		'../semantic-ui/image.css'
	]
};

