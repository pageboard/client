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
	bundle: 'chart',
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
	title: 'Legend',
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
	inplace: true,
	contents: "chart_list_item+",
	group: "block",
	icon: '<i class="list ul icon"></i>',
	tag: 'ul',
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
	menu: 'widget',
	inplace: true,
	contents: "inline*",
	icon: '<i class="list icon"></i>',
	html: `<li></li>`,
};

exports.chart_table_body = {
	...exports.table_body,
	bundle: 'chart',
	menu: 'widget',
	contents: 'chart_table_row+'
};
exports.chart_table_row = {
	...exports.table_row,
	bundle: 'chart',
	menu: 'widget',
	contents: 'chart_table_head_cell chart_table_cell'
};

exports.chart_table_head_cell = {
	title: "Head Cell",
	bundle: 'chart',
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
	bundle: 'chart',
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
