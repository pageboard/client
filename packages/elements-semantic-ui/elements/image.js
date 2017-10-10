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
		roi: {
			title: "Region of interest",
			type: "object",
			properties: {
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
		cover: {
			title: "Cover",
			type: "object",
			properties: {
				horizontal: {
					type: "boolean",
					title: "Horizontal",
					default: false
				},
				vertical: {
					type: "boolean",
					title: "Vertical",
					default: false
				}
			}
		},
		crop: {
			title: 'Crop',
			description: 'All values are percents of the original image',
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
					title: "Max width"
				},
				height: {
					type: "integer",
					minimum: 0,
					maximum: 100,
					default: 100,
					multipleOf: 5,
					title: "Max height"
				}
			},
//			input: {
//				name: 'roi'
//			}
		}
	},
//	contents: {
//		legend: {
//			spec: "inline*"
//		}
//	},
	group: "block",
	icon: '<i class="icon image"></i>',
	tag: '.ui.image',
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
		var r = d.roi;
		if (r && (r.x != 50 || r.y != 50 || r.width != 100 || r.height != 100)) {
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
			obj.query.rs = `w:${w}`;
			return `${Page.format(obj)} ${w}w`;
		}

		var node = doc.dom`<div class="ui image"><img src="${tUrl}"
			srcset="${responsiveUrl(160)},
			${responsiveUrl(320)},
			${responsiveUrl(640)},
			${responsiveUrl(1280)}" />
		</div>`;
		if (d.cover) {
			if (d.cover.horizontal) node.classList.add('horizontal');
			if (d.cover.vertical) node.classList.add('vertical');
		}
		if (d.roi) {
			if (d.roi.horizontal) node.classList.add(d.roi.horizontal);
			if (d.roi.vertical) node.classList.add(d.roi.vertical);
		}
		return node;
	},
	stylesheets: [
		'../ui/image.css'
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
