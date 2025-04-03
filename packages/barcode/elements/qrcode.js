exports.qrcode = {
	title: "QRCode",
	priority: 21,
	icon: '<i class="qrcode icon"></i>',
	menu: "media",
	bundle: true,
	group: 'block',
	properties: {
		text: {
			title: 'Text to encode',
			type: 'string',
			format: 'singleline'
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
		}
	},
	html: `<element-qrcode data-text="[text]" data-dimension="[dimension.length][dimension.unit]" data-color-front="[color?.front]" data-color-back="[color?.back]" data-padding="[padding]"></element-qrcode>`,
	scripts: [
		'../lib/qrcode.js'
	],
	stylesheets: [
		'../ui/qrcode.css'
	]
};
