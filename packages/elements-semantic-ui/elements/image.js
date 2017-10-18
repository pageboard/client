Pageboard.elements.image = {
	title: "Image",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
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
						title: "Natural",
						constant: "none"
					}, {
						title: "Contain",
						constant: "contain"
					}, {
						title: "Cover",
						constant: "cover"
					}],
					title: "fit",
					default: "contain"
				},
				horizontal: {
					title: "horizontal",
					oneOf: [{
						constant: "left",
						title: "left"
					}, {
						constant: "hcenter",
						title: "center"
					}, {
						constant: "right",
						title: "right"
					}],
					default: "hcenter"
				},
				vertical: {
					title: "vertical",
					oneOf: [{
						constant: "top",
						title: "top"
					}, {
						constant: "vcenter",
						title: "center"
					}, {
						constant: "bottom",
						title: "bottom"
					}],
					default: "vcenter"
				}
			}
		},
		crop: {
			title: 'Crop',
			type: "object",
			properties: {
				x: {
					type: "integer",
					minimum: 0,
					maximum: 100,
					default: 50,
					multipleOf: 5,
					title: "Horizontal center"
				},
				y: {
					minimum: 0,
					maximum: 100,
					default: 50,
					multipleOf: 5,
					type: "integer",
					title: "Vertical center"
				},
				width: {
					type: "integer",
					minimum: 0,
					maximum: 100,
					default: 100,
					multipleOf: 5,
					title: "Width"
				},
				height: {
					type: "integer",
					minimum: 0,
					maximum: 100,
					default: 100,
					multipleOf: 5,
					title: "Height"
				},
				zoom: {
					type: "integer",
					minimum: 1,
					maximum: 150,
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

		var node = doc.dom`<element-image><img src="${tUrl}"
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
			if (posx == "hcenter") posx = display.horizontal = "center";
			var posy = display.vertical;
			if (posy == "vcenter") posy = display.vertical = "center";
			node.dataset.position = `${posx || 'center'} ${posy || 'center'}`;
		}
		return node;
	},
	stylesheets: [
		'../ui/element-image.css'
	],
	scripts: [
		'../ui/object-fit-images.js',
		'../ui/element-image.js'
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
