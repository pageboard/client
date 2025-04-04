exports.table = {
	title: "Table",
	menu: 'widget',
	icon: '<i class="table icon"></i>',
	group: "block",
	contents: "table_caption? table_head? table_body table_foot?",
	properties: {
		definition: {
			title: 'Definition',
			type: 'boolean',
			default: false
		},
		single: {
			title: 'Single line',
			type: 'boolean',
			default: false
		},
		unstackable: {
			title: 'Unstackable',
			type: 'boolean',
			default: false
		},
		selectable: {
			title: 'Selectable rows',
			type: 'boolean',
			default: false
		},
		striped: {
			title: 'Striped',
			type: 'boolean',
			default: false
		},
		celled: {
			title: 'Celled',
			type: 'boolean',
			default: false
		},
		basic: {
			title: 'Basic',
			type: 'boolean',
			default: false
		},
		collapsing: {
			title: 'Collapsing',
			type: 'boolean',
			default: false
		},
		compact: {
			title: 'Compact',
			type: 'boolean',
			default: false
		}
	},
	html: `<table class="ui table
		[definition]
		[single|?|post: line]
		[unstackable]
		[selectable]
		[striped]
		[celled]
		[basic]
		[collapsing]
		[compact]"
	></table>`,
	stylesheets: [
		'../ui/components/table.css'
	]
};

exports.table_caption = {
	title: "Caption",
	menu: 'widget',
	icon: '<b class="icon">caption</b>',
	contents: "block+",
	inplace: true,
	html: '<caption></caption>'
};

exports.table_head = {
	title: "Head",
	menu: 'widget',
	icon: '<b class="icon">head</b>',
	contents: {
		id: 'cells',
		nodes: 'table_head_cell+'
	},
	inplace: true,
	html: '<thead><tr block-content="cells"></tr></thead>'
};

exports.table_foot = {
	title: "Foot",
	menu: 'widget',
	icon: '<b class="icon">foot</b>',
	contents: {
		id: 'cells',
		nodes: 'table_head_cell+'
	},
	inplace: true,
	html: '<tfoot><tr block-content="cells"></tr></tfoot>'
};

exports.table_body = {
	title: "Body",
	menu: 'widget',
	icon: '<b class="icon">body</b>',
	contents: 'table_row+',
	inplace: true,
	html: '<tbody></tbody>'
};

exports.table_row = {
	title: "Row",
	menu: 'widget',
	icon: '<b class="icon">row</b>',
	contents: '(table_cell|table_head_cell)+',
	inplace: true,
	html: '<tr></tr>'
};

exports.table_cell = {
	title: "Cell",
	menu: 'widget',
	icon: '<i class="icons"><b class="icon">cell</b><i class="corner add icon"></i></i>',
	properties: {
		align: {
			title: 'Align',
			anyOf: [{
				const: null,
				title: "Left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "Center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "Right",
				icon: '<i class="icon align right"></i>'
			}]
		},
		selectable: {
			title: 'Selectable',
			description: 'Use a link inside a selectable cell to make the hit box the entire cell area',
			type: 'boolean',
			default: false
		},
		rowspan: {
			title: 'Row span',
			type: 'integer',
			minimum: 0,
			maximum: 65534,
			default: 1
		},
		colspan: {
			title: 'Column span',
			type: 'integer',
			minimum: 1,
			maximum: 1000,
			default: 1
		}
	},
	inplace: true,
	contents: "block+",
	tag: 'td:not([is])',
	parse: function(dom) {
		const d = {};
		if (dom.classList.contains('center')) d.align = 'center';
		else if (dom.classList.contains('right')) d.align = 'right';
		if (dom.classList.contains('selectable')) d.selectable = true;
		if (dom.rowspan) d.rowspan = dom.rowspan;
		if (dom.colspan) d.colspan = dom.colspan;
		return d;
	},
	html: '<td class="[align|post: aligned] [selectable]" rowspan="[rowspan]" colspan="[colspan]"></td>'
};

exports.table_head_cell = {
	title: "Head Cell",
	menu: 'widget',
	icon: '<i class="icons"><b class="icon">head</b><i class="corner add icon"></i></i>',
	properties: {
		align: exports.table_cell.properties.align,
		width: {
			title: 'Column width',
			description: 'Between 1 and 16, set to 0 for none',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		},
		rowspan: {
			title: 'Row span',
			type: 'integer',
			minimum: 0,
			maximum: 65534,
			default: 1
		},
		colspan: {
			title: 'Column span',
			type: 'integer',
			minimum: 1,
			maximum: 1000,
			default: 1
		},
		scope: {
			title: 'Scope',
			anyOf: [{
				const: null,
				title: 'None'
			}, {
				const: 'row',
				title: 'Row'
			}, {
				const: 'col',
				title: 'Column'
			}]
		}
	},
	parse: function (dom) {
		const d = {};
		if (dom.classList.contains('center')) d.align = 'center';
		else if (dom.classList.contains('right')) d.align = 'right';
		if (dom.classList.contains('selectable')) d.selectable = true;
		if (dom.rowspan) d.rowspan = dom.rowspan;
		if (dom.colspan) d.colspan = dom.colspan;
		if (dom.scope) d.scope = dom.scope;
		if (dom.dataset.width) d.width = parseInt(dom.dataset.width) || null;
		return d;
	},
	contents: "block+",
	tag: 'th',
	inplace: true,
	html: '<th class="[align|post: aligned] [width|as:colnums|post: wide]" data-width="[width]" rowspan="[rowspan]" colspan="[colspan]" scope="[scope]"></th>',
	stylesheets: [
		"../ui/table.css"
	]
};

