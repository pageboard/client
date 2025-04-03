exports.barcode = {
	title: "Barcode",
	priority: 21,
	icon: '<i class="barcode icon"></i>',
	menu: "media",
	bundle: true,
	group: 'block',
	properties: {
		format: {
			title: 'Format',
			anyOf: [{
				const: 'ean13',
				title: 'EAN-13'
			}, {
				const: 'upca',
				title: 'UPC-A'
			}, {
				const: 'ean8',
				title: 'EAN-8'
			}],
			default: 'ean13'
		},
		text: {
			title: 'Text to encode',
			type: 'string',
			format: 'singleline'
		},
		ratio: {
			title: 'Ratio',
			type: 'integer',
			default: 50
		},
		padding: {
			title: 'Padding',
			type: 'integer',
			default: 0
		},
		color: {
			type: 'object',
			properties: {
				front: {
					title: 'Front',
					type: 'string',
					format: 'hex-color',
					$helper: {
						name: 'color',
						alpha: true
					}
				},
				back: {
					title: 'Back',
					type: 'string',
					format: 'hex-color',
					$helper: {
						name: 'color',
						alpha: true
					}
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
		}
	},
	html: `<element-barcode data-format="[format]" data-text="[text]" data-ratio="[ratio]" data-dimension="[dimension.length][dimension.unit]" data-color-front="[color?.front]" data-color-back="[color?.back]" data-padding="[padding]"></element-barcode>`,
	scripts: [
		'../lib/barcode.js'
	],
	stylesheets: [
		'../ui/barcode.css'
	]
};
