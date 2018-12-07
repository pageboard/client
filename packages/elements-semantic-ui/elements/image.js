Pageboard.elements.image = {
	title: "Image",
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
		display: {
			title: "Display",
			type: "object",
			properties: {
				fit: {
					anyOf: [{
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
					default: "none"
				},
				horizontal: {
					title: "horizontal",
					anyOf: [{
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
					anyOf: [{
						const: "top",
						title: "top"
					}, {
						const: "vcenter",
						title: "center"
					}, {
						const: "bottom",
						title: "bottom"
					}],
					default: "top"
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
	group: "block",
	tag: 'element-image',
	buildLoc: function(url, d) {
		if (!url) return {
			pathname: "",
			query: {}
		};
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
		if (r.x != null && r.y != null && r.width != null && r.height != null &&
			(r.x != 50 || r.y != 50 || r.width != 100 || r.height != 100)) {
			if (r.x - r.width / 2 < 0 || r.x + r.width / 2 > 100) {
				r.width = 2 * Math.min(r.x, 100 - r.x);
			}
			if (r.y - r.height / 2 < 0 || r.y + r.height / 2 > 100) {
				r.height = 2 * Math.min(r.y, 100 - r.y);
			}
			loc.query.ex = `x-${r.x}_y-${r.y}_w-${r.width}_h-${r.height}`;
		}
		if (r.zoom != null && r.zoom != 100) {
			loc.query.rs = `z-${r.zoom}`;
		}
		return loc;
	},
	contents: {
		legend: {
			title: 'legend',
			spec: "inline*"
		}
	},
	html: `<element-image class="[lqip|?]"
		data-fit="[fit]" data-position="[position]" data-lqip="[lqip]"
		data-url="[url]"
	>
		<img alt="[alt]" src="[src]"
			data-width="[width]" data-height="[height]" data-zoom="[zoom]" />
		<div block-content="legend"></div>
	</element-image>`,
	fuse: function(node, d, scope) {
		var obj = {
			alt: d.alt
		};
		var loc = this.buildLoc(d.url || this.resources[0], d);
		var display = d.display;
		var fit = display && display.fit || "none";
		if (display) {
			obj.fit = fit;
			var posx = display.horizontal;
			if (posx == "hcenter") posx = "center";
			var posy = display.vertical;
			if (posy == "vcenter") posy = "center";
			obj.position = `${posx || 'center'} ${posy || 'center'}`;
		}
		var zoom = (d.crop || {}).zoom || 100;
		var meta = (scope.$hrefs || {})[d.url];
		if (meta && meta.width && meta.height) {
			var wf = (d.crop || {}).width || 100;
			var wh = (d.crop || {}).height || 100;
			obj.width = Math.round(meta.width * wf / 100);
			obj.height = Math.round(meta.height * wh / 100);
			if (zoom != 100) obj.zoom = zoom;
			var isSvg = meta.mime == "image/svg+xml";
			var isFit = fit != "none";
			if (!isSvg && !isFit) {
				obj.lqip = loc.query.q = 5;
				if (isFit) loc.query.rs = "w-320_h-320_max";
			} else if (isFit || !isSvg) {
				obj.url = Page.format(loc);
				loc = null;
			}
		}
		obj.src = loc ? Page.format(loc) : null;
		node.fuse(obj, scope);
	},
	resources: [
		'../ui/empty.png'
	],
	stylesheets: [
		'../ui/image.css'
	],
	scripts: [
		'../lib/object-fit-images.js',
		'../ui/image.js'
	]
};

Pageboard.elements.inlineImage = {
	priority: 12,
	title: "Icon",
	icon: '<i class="icon image"></i>',
	properties: {
		url: {
			title: 'Address',
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
	html: `<img src="[src]"
		alt="" class="ui inline image
		[display.avatar|?]
		[display.rounded|?]
		[display.circular|?]
		[display.spaced|?]
		[display.floated|pre:floated ]
		[display.align|post: aligned]" />`,
	fuse: function(node, d, scope) {
		var loc = Pageboard.elements.image.buildLoc(d.url || this.resources[0], d);
		node.fuse(Object.assign({
			src: Page.format(loc)
		}, d), scope);
	},
	resources: [
		'../ui/empty.png'
	],
	stylesheets: [
		'../lib/components/image.css'
	],
	polyfills: [
		'IntersectionObserver'
	]
};

