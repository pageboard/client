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
		}
	},
	contents: {
		id: "label",
		nodes: "block+"
	},
	html: `<div class="ui statistic">
		<div class="value" title="[name]">[value|digits:[precision]]</div>
		<div class="label" block-content="label"></div>
	</div>`,
	stylesheets: [
		"../ui/components/statistic.css"
	]
};
