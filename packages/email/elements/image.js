exports.mail_image = {
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
		}
	},
	group: "mail_block",
	buildLoc: function(url, d, meta) {
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
		if (meta && meta.mime == "image/svg+xml") loc.query.format = 'png';
		return loc;
	},
	html: '<img src="[src]" alt="" />',
	fuse: function(node, d, scope) {
		var loc = this.buildLoc(d.url || this.resources.empty, d, (scope.$hrefs || {})[d.url]);
		node.fuse(Object.assign({
			src: Page.format(loc)
		}, d), scope);
	},
	resources: {
		empty: '../ui/empty.png'
	}
};

