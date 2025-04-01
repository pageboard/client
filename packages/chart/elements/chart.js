exports.chart = {
	title: "Chart",
	priority: 21,
	bundle: true,
	group: 'block',
	menu: 'widget',
	icon: '<i class="chart pie icon"></i>',
	properties: {
		chart: {
			title: 'Chart',
			anyOf: [{
				const: null,
				title: 'Table'
			}, {
				const: 'bar',
				title: 'Bar'
			}, {
				const: 'column',
				title: 'Column'
			}, {
				const: 'area',
				title: 'Area'
			}, {
				const: 'line',
				title: 'Line'
			}, {
				const: 'pie',
				title: 'Pie'
			}]
		},
		precision: {
			title: 'Precision',
			type: 'integer',
			default: 0
		},
		unit: {
			title: 'Unit',
			type: 'string',
			format: 'singleline',
			nullable: true
		},
		stacked: {
			title: 'Stacked',
			type: 'boolean'
		},
		hideData: {
			title: 'Hide values',
			type: 'boolean'
		},
		position: {
			title: 'Position',
			anyOf: [{
				const: null,
				title: 'End'
			}, {
				const: 'start',
				title: 'Start'
			}, {
				const: 'center',
				title: 'Center'
			}, {
				const: 'outside',
				title: 'Outside'
			}]
		},
		axes: {
			title: 'Axes',
			properties: {
				primary: {
					title: 'Show primary axe',
					type: 'boolean'
				},
				data: {
					title: 'Show data axes',
					type: 'boolean'
				},
				secondary: {
					title: 'Secondary lines',
					type: 'integer',
					minimum: 0,
					maximum: 10
				}
			}
		},
		spacing: {
			title: 'Spacing',
			properties: {
				data: {
					title: 'Data',
					type: 'integer',
					minimum: 0,
					maximum: 20
				},
				dataset: {
					title: 'Datasets',
					type: 'integer',
					minimum: 0,
					maximum: 20
				}
			}
		},
		orientation: {
			title: 'Orientation',
			properties: {
				reverse: {
					title: 'Reverse',
					type: 'boolean'
				},
				reverseLabels: {
					title: 'Reverse labels',
					type: 'boolean'
				},
				reverseData: {
					title: 'Reverse data',
					type: 'boolean'
				},
				reverseDatasets: {
					title: 'Reverse datasets',
					type: 'boolean'
				}
			}
		}
	},
	contents: "table_caption? table_head? chart_body table_foot?",
	html: `<table is="element-chart-table" class="ui table show-heading [stacked|pre:multiple ] [labels] [axes.primary|and:show-primary-axis] [axes.secondary|pre:show-|post:-secondary-axes] [axes.data|and:show-data-axes] [spacing.data|pre:data-spacing-] [spacing.datasets|pre:dataset-spacing-] [hideData] [position|pre:data-] [orientation.reverse] [orientation.reverseLabels] [orientation.reverseData] [orientation.reverseDatasets]" data-precision="[precision]" data-unit="[unit]" data-chart="[chart]"></table>`,
	stylesheets: [
		'../lib/charts.css',
		'../ui/chart.css'
	],
	scripts: [
		'../ui/chart.js'
	]
};

exports.chart_legend = {
	title: 'Chart Legend',
	bundle: 'chart',
	menu: 'widget',
	properties: {
		marker: {
			title: 'Marker',
			anyOf: [{
				const: null,
				title: 'Default'
			}, {
				const: 'rectangle',
				title: 'Rectangle'
			}, {
				const: 'square',
				title: 'Square'
			}, {
				const: 'circle',
				title: 'Circle'
			}, {
				const: 'rhombus',
				title: 'Rhombus'
			}, {
				const: 'line',
				title: 'Line'
			}]
		},
		inline: {
			title: 'Inline',
			type: 'boolean'
		}
	},
	contents: "chart_list_item+",
	group: "block",
	icon: '<i class="icons"><i class="chart pie icon"></i><i class="corner question circle outline icon"></i></i>',
	parse: function (dom) {
		let marker = null;
		const style = dom.style.listStyleType;
		if (style && this.properties.marker.anyOf.some(item => item.const == style)) {
			marker = style;
		}
		return { marker };
	},
	html: `<ul class="charts-css legend [marker|pre:legend-] [inline|and:legend-inline]"></ul>`
};

exports.chart_list_item = {
	title: 'Item',
	bundle: 'chart',
	context: 'chart_legend//',
	menu: 'widget',
	inplace: true,
	contents: "inline*",
	icon: '<i class="list icon"></i>',
	html: `<li></li>`,
};

exports.chart_body = {
	...exports.table_body,
	bundle: 'chart',
	context: 'chart//',
	menu: 'widget',
	contents: 'chart_row+'
};

exports.chart_row = {
	...exports.table_row,
	bundle: 'chart',
	context: 'chart//',
	menu: 'widget',
	contents: '(chart_cell|chart_head_cell) chart_value+'
};

exports.chart_cell = {
	...exports.table_cell,
	bundle: 'chart',
	context: 'chart_row/',
	contents: 'inline*'
};

exports.chart_head_cell = {
	...exports.table_head_cell,
	bundle: 'chart',
	context: 'chart_row/',
	contents: 'inline*'
};

exports.chart_value = {
	title: "Cell",
	bundle: 'chart',
	menu: 'widget',
	context: 'chart_table//',
	icon: '<i class="icons"><b class="icon">cell</b><i class="corner add icon"></i></i>',
	properties: {
		value: {
			title: 'Value',
			type: 'number'
		}
	},
	parse: function (dom) {
		return { value: parseInt(dom.dataset.value) };
	},
	inplace: true,
	tag: 'td',
	html: '<td is="element-chart-cell" data-value="[value]"></td>'
};
