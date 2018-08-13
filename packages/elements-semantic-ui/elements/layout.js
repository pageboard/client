Pageboard.elements.layout = {
	title: "Layout",
	icon: '<i class="icon move"></i>',
	properties: {
		horizontal: {
			title: 'horizontal',
			description: 'Position horizontally',
			default: "left",
			anyOf: [{
				const: "left",
				title: "left"
			}, {
				const: "hcenter",
				title: "center"
			}, {
				const: "right",
				title: "right"
			}]
		},
		vertical: {
			title: 'vertical',
			description: 'Position vertically',
			default: "top",
			anyOf: [{
				const: "top",
				title: "top"
			}, {
				const: "vcenter",
				title: "center"
			}, {
				const: "bottom",
				title: "bottom"
			}]
		},
		width: {
			title: 'control width',
			default: "full",
			anyOf: [{
				const: "full",
				title: "full"
			}, {
				const: "contained",
				title: "contained"
			}]
		},
		height: {
			title: 'height',
			description: 'height in vh units',
			type: 'number',
			minimum: 0,
			maximum: 999,
			default: 0
		},
		direction: {
			title: 'direction',
			default: "column",
			anyOf: [{
				const: "column",
				title: "column"
			}, {
				const: "row",
				title: "row"
			}]
		},
		invert: {
			title: 'invert',
			description: 'Invert background',
			default: false,
			type: 'boolean'
		}
	},
	contents: {
		content: {
			spec: "block+"
		}
	},
	group: 'block',
	html: `<div class="layout
		[width|eq:full:fullwidth:]
		[width|eq:contained:ui container:]
		[horizontal|?]
		[vertical|?]
		[direction]
		[invert|?:inverted]" block-content="content" style="height:[height|eq:0:|not|post:%|magnet]">
	</div>`,
	stylesheets: [
		'../semantic-ui/container.css',
		'../ui/layout.css'
	]
};

