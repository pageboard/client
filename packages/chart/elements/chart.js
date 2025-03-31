exports.chart = {
	title: "Chart",
	priority: 21,
	icon: '<i class="chart line icon"></i>',
	menu: "widget",
	bundle: true,
	group: 'block',
	contents: "(chart_table|chart_legend)+",
	html: `<div></div>`,
	stylesheets: [
		'../lib/charts.css',
		'../ui/chart.css'
	],
	scripts: [
		'../ui/chart.js'
	]
};

exports.chart_table = {
	title: "Table",
	menu: 'widget',
	icon: '<i class="table icon"></i>',
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
		}
	},
	contents: "table_caption? table_head? chart_table_body table_foot?",
	html: `<table is="element-chart-table" class="ui table [heading] [labels] [primaryAxis] [secondaryAxis] [dataAxes] [spacing] [hideData]" data-precision="[precision]" data-unit="[unit]" data-chart="[chart]"></table>`
};

exports.chart_legend = {
	contents: "list_item+",
	html: `<ul class="charts-css legend [inline] [shape]"></ul>`
};

exports.chart_table_body = { ...exports.table_body, contents: 'chart_table_row+' };
exports.chart_table_row = { ...exports.table_row, contents: 'chart_table_head_cell chart_table_cell' };

exports.chart_table_head_cell = {
	title: "Head Cell",
	menu: 'widget',
	group: 'table_cell',
	context: 'chart_table//',
	icon: '<i class="icons"><b class="icon">cell</b><i class="corner add icon"></i></i>',
	inplace: true,
	tag: 'th',
	contents: "inline*",
	html: '<th is="element-chart-cell" data-value="[value]" class="[width|as:colnums|post: wide]"></th>'
};

exports.chart_table_cell = {
	title: "Cell",
	menu: 'widget',
	group: 'table_cell',
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
	html: '<td is="element-chart-cell" data-value="[value]" class="[width|as:colnums|post: wide]"></td>'
};
