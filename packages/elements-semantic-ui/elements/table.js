Pageboard.elements.table = {
	title: "Table",
	menu: 'widget',
	icon: '<i class="table icon"></i>',
	group: "block",
	contents: {
		content: {
			spec: "table_head? table_body table_foot?"
		}
	},
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
	html: `<table block-content="content"
	class="ui table [definition|?] [single|?|post: line] [unstackable|?] [selectable|?] [striped|?] [celled|?] [basic|?] [collapsing|?] [compact|?]"></table>`,
	stylesheets: [
		'../semantic-ui/table.css'
	]
};


Pageboard.elements.table_head = {
	title: "Head",
	menu: 'widget',
	icon: '<b class="icon">head</b>',
	contents: {
		cells: 'table_head_cell+'
	},
	inplace: true,
	html: '<thead><tr block-content="cells"></tr></thead>'
};

Pageboard.elements.table_foot = {
	title: "Foot",
	menu: 'widget',
	icon: '<b class="icon">foot</b>',
	contents: {
		cells: 'table_head_cell+'
	},
	inplace: true,
	html: '<tfoot><tr block-content="cells"></tr></tfoot>'
};

Pageboard.elements.table_body = {
	title: "Body",
	menu: 'widget',
	icon: '<b class="icon">body</b>',
	contents: 'table_row+',
	inplace: true,
	html: '<tbody></tbody>'
};

Pageboard.elements.table_row = {
	title: "Row",
	menu: 'widget',
	icon: '<b class="icon">row</b>',
	contents: 'table_cell+',
	inplace: true,
	html: '<tr></tr>'
};

Pageboard.elements.table_cell = {
	title: "Cell",
	menu: 'widget',
	icon: '<i class="icons"><b class="icon">cell</b><i class="corner add icon"></i></i>',
	properties: {
		align: {
			title: 'Align',
			default: "",
			anyOf: [{
				const: "",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}]
		},
		selectable: {
			title: 'Selectable',
			description: 'Use a link inside a selectable cell to make the hit box the entire cell area',
			type: 'boolean',
			default: false
		}
	},
	inplace: true,
	contents: "inline*",
	tag: 'td',
	parse: function(dom) {
		var d = {};
		if (dom.matches('.center')) d.align = 'center';
		else if (dom.matches('.right')) d.align = 'right';
		if (dom.matches('.selectable')) d.selectable = true;
		return d;
	},
	html: '<td class="[align|post: aligned] [selectable|?]"></td>'
};

Pageboard.elements.table_head_cell = {
	title: "Cell",
	menu: 'widget',
	icon: '<i class="icons"><b class="icon">head</b><i class="corner add icon"></i></i>',
	properties: {
		align: Pageboard.elements.table_cell.properties.align,
		width: {
			title: 'Column width',
			description: 'Between 1 and 16, set to 0 for none',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		}
	},
	contents: "inline*",
	tag: 'th',
	inplace: true,
	parse: function(dom) {
		var d = {};
		var pre = Pageboard.elements.grid.prefixes;
		Object.keys(pre).forEach(function(w) {
			var sel = pre[w];
			if (sel && dom.matches(`.${sel}.wide`)) d.width = w;
		});
		return d;
	},
	html: '<th class="[align|post: aligned] [width|num: wide]"></th>'
};

