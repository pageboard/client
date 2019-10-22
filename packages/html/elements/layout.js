exports.layout = {
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
				const: "hbetween",
				title: "spaced between"
			}, {
				const: "haround",
				title: "spaced around"
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
				const: "vstretch",
				title: "stretch"
			}, {
				const: "vbaseline",
				title: "baseline"
			}, {
				const: "bottom",
				title: "bottom"
			}]
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
			type: 'number',
			minimum: 0,
			default: 0
		},
		heightUnits: {
			title: 'height units',
			default: '%',
			anyOf: [{
				title: '%',
				const: '%'
			}, {
				title: 'vh',
				const: 'vh'
			}, {
				title: 'em',
				const: 'em'
			}, {
				title: 'rem',
				const: 'rem'
			}, {
				title: 'px',
				const: 'px'
			}]
		},
	},
	contents: "block+",
	group: 'block',
	html: `<div class="layout
		[width|eq:full:fullwidth:]
		[width|eq:contained:ui container:]
		[horizontal|?]
		[vertical|?]
		[direction]
		[invert|?:inverted]" style="height:[height|eq:0:|not|magnet][heightUnits|or:%]">
	</div>`,
	stylesheets: [
		'../lib/components/container.css',
		'../ui/layout.css'
	]
};

