exports.statistic = {
	title: 'Stat',
	menu: "widget",
	group: "block",
	icon: '<b class="icon">‰</b>',
	properties: {
		name: {
			title: 'Name',
			type: 'string',
			format: 'singleline'
		},
		value: {
			title: 'Value',
			type: 'number'
		},
		precision: {
			title: 'Precision',
			type: 'integer',
			default: 0
		},
		size: {
			title: 'Size',
			anyOf: [{
				const: null,
				title: 'Default'
			}, {
				const: 'mini',
				title: 'Mini'
			}, {
				const: 'tiny',
				title: 'Tiny'
			}, {
				const: 'small',
				title: 'Small'
			}, {
				const: 'large',
				title: 'Large'
			}, {
				const: 'huge',
				title: 'Huge'
			}]
		}
	},
	contents: {
		id: "label",
		nodes: "block+"
	},
	html: `<div class="ui [size] statistic">
		<div class="value" title="[name]">[value|digits:[precision]]</div>
		<div class="label" block-content="label"></div>
	</div>`,
	stylesheets: [
		"../ui/components/statistic.css"
	]
};
