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
//	contents: {
//		legend: {
//			spec: "inline*"
//		}
//	},
	group: "block",
	icon: '<i class="icon image"></i>',
	tag: 'element-image',
	render: function(doc, block) {
		var d = block.data;
		var obj = Page.parse(d.url || '/.files/@pageboard/elements/ui/placeholder.png');
		if (obj.hostname && obj.hostname != document.location.hostname) {
			obj = {
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
			obj.query.ex = `x:${r.x},y:${r.y},w:${r.width},h:${r.height}`;
		}
		var tUrl = Page.format(obj);

		function responsiveUrl(w) {
			var obj = Page.parse(tUrl);
			obj.query.rs = `w:${Math.round(w * zoom / 100)}`;
			return `${Page.format(obj)} ${w}w`;
		}

		var node = doc.dom`<element-image><img src="${tUrl}" alt="${d.alt || ''}"
			srcset="${responsiveUrl(160)},
			${responsiveUrl(320)},
			${responsiveUrl(640)},
			${responsiveUrl(1280)}" />
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

//Pageboard.elements.inline_image = {
//	title: "Image",
//	properties: Pageboard.elements.image.properties,
//	inline: true,
//	group: "inline",
//	icon: '<i class="icon image"></i>',
//	render: function(doc, block) {
//		var img = Pageboard.elements.image.render(doc, block);
//		img.className = "ui avatar image";
//		return img;
//	}
//};
