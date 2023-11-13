exports.mail_image = {
	title: "Image",
	icon: '<i class="icon image"></i>',
	properties: {
		alt: {
			title: 'Alternative text',
			description: 'Short contextual description.\nLeave empty when used in links.',
			type: "string"
		},
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
	html: `<center><img is="element-mail-img"
		class="float-center" align="center"
		data-src="[url]"
		data-crop="[crop.x];[crop.y];[crop.width];[crop.height];[crop.zoom]"
		alt="[alt]" /></center>`,
	scripts: ['../ui/image.js']
};

