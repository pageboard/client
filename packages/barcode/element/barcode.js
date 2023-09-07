exports.barcode = {
	priority: 21,
	title: "Barcode",
	icon: '<i class="barcode icon"></i>',
	menu: "media",
	bundle: true,
	group: 'block',
	properties: {
		bcid: {
			title: 'Barcode type',
			anyOf: [{
				const: 'qrcode',
				title: 'QR code'
			}, {
				const: 'ean13',
				title: 'EAN-13'
			}, {
				const: 'isbn',
				title: 'ISBN'
			}]
		},
		text: {
			title: 'Text to encode',
			type: 'string',
			format: 'singleline'
		},
		scaleX: {
			title: 'X scale',
			type: 'integer',
			default: 3
		},
		scaleY: {
			title: 'Y scale',
			type: 'integer',
			default: 3
		},
		dimension: {
			title: 'Dimension',
			type: 'object',
			properties: {
				length: {
					title: 'Length',
					type: 'number',
					minimum: 0,
					default: 3
				},
				unit: {
					title: 'Unit',
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
				}
			}
		}
	},
	html: `<element-barcode data-bcid="[bcid]" data-text="[text]" data-scale-x="[scaleX]" data-scale-y="[scaleY]" data-dimension="[dimension.length][dimension.unit]"></element-barcode>`,
	scripts: [
		'../lib/barcode.js'
	],
	stylesheets: [
		'../ui/barcode.css'
	]
};
