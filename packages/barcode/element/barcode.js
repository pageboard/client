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
		width: {
			title: 'Width',
			type: 'integer',
			default: 3
		},
		height: {
			title: 'Height',
			type: 'integer',
			default: 3
		}
	},
	html: `<element-barcode data-bcid="[bcid]" data-text="[text]" data-scale-x="[width]" data-scale-y="[height]"></element-barcode>`,
	scripts: [
		'../lib/barcode.js'
	],
	stylesheets: [
		'../ui/barcode.css'
	]
};
