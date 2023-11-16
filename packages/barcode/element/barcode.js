exports.barcode = {
	title: "Barcode",
	priority: 21,
	icon: '<i class="barcode icon"></i>',
	menu: "media",
	bundle: true,
	group: 'block',
	properties: {
		bcid: {
			title: 'Barcode type',
			anyOf: [{
				const: 'qrcode',
				title: 'QR Code'
			}, {
				const: 'ean13',
				title: 'EAN-13'
			}, {
				const: 'upca',
				title: 'UPC-A'
			}, {
				const: 'isbn',
				title: 'ISBN'
			}],
			default: 'qrcode'
		},
		text: {
			title: 'Text to encode',
			type: 'string',
			format: 'singleline'
		},
		scaleX: {
			title: 'X scale',
			type: 'integer',
			default: 2
		},
		scaleY: {
			title: 'Y scale',
			type: 'integer',
			default: 2
		},
		color: {
			type: 'object',
			properties: {
				front: {
					title: 'Front',
					type: 'string',
					format: 'hex-color',
					$helper: 'color'
				},
				back: {
					title: 'Back',
					type: 'string',
					format: 'hex-color',
					$helper: 'color'
				}
			},
			nullable: true
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
		},
		rotate: {
			title: 'Rotate',
			anyOf: [{
				type: 'null',
				title: 'No'
			}, {
				const: 'R',
				title: 'Right',
			}, {
				const: 'L',
				title: 'Left',
			}, {
				const: 'I',
				title: 'Inverted'
			}]
		}
	},
	html: `<element-barcode data-bcid="[bcid]" data-text="[text]" data-scale-x="[scaleX]" data-scale-y="[scaleY]" data-dimension="[dimension.length][dimension.unit]" data-color-front="[color?.front]" data-color-back="[color?.back]" data-rotate="[rotate]"></element-barcode>`,
	scripts: [
		'../lib/bwip.js',
		'../ui/barcode.js'
	],
	stylesheets: [
		'../ui/barcode.css'
	]
};
