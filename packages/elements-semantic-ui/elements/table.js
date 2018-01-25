Pageboard.elements.table = {
	title: "Table",
	menu: 'widget',
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
	icon: '<i class="table icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<table class="ui table" block-content="content"></table>`;
		if (d.definition) node.classList.add('definition');
		if (d.single) node.classList.add('single', 'line');
		if (d.unstackable) node.classList.add('unstackable');
		if (d.selectable) node.classList.add('selectable');
		if (d.striped) node.classList.add('striped');
		if (d.celled) node.classList.add('celled');
		if (d.basic) node.classList.add('basic');
		if (d.collapsing) node.classList.add('collapsing');
		if (d.compact) node.classList.add('compact');
		return node;
	},
	stylesheets: [
		'../semantic-ui/table.css'
	]
};


Pageboard.elements.table_head = {
	title: "Head",
	menu: 'widget',
	properties: {
		fullWidth: {
			title: 'Full width',
			description: 'fills gap in first column of definition table',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		cells: {
			spec: 'table_head_cell+',
			title: 'Cells'
		}
	},
	icon: '<b class="icon">head</b>',
	render: function(doc, block) {
		var node = doc.dom`<thead><tr block-content="cells"></tr></thead>`;
		if (block.data.fullWidth) node.classList.add('full-width');
		return node;
	}
};

Pageboard.elements.table_foot = {
	title: "Foot",
	menu: 'widget',
	properties: {
		fullWidth: {
			title: 'Full width',
			description: 'fills gap in first column of definition table',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		cells: {
			spec: 'table_head_cell+',
			title: 'Cells'
		}
	},
	icon: '<b class="icon">foot</b>',
	render: function(doc, block) {
		var node = doc.dom`<tfoot><tr block-content="cells"></tr></tfoot>`;
		if (block.data.fullWidth) node.classList.add('full-width');
		return node;
	}
};

Pageboard.elements.table_body = {
	title: "Body",
	menu: 'widget',
	properties: {
	},
	contents: {
		rows: {
			spec: 'table_row+',
			title: 'Rows'
		}
	},
	icon: '<b class="icon">body</b>',
	render: function(doc, block) {
		return doc.dom`<tbody block-content="rows"></tbody>`;
	}
};

Pageboard.elements.table_row = {
	title: "Row",
	menu: 'widget',
	properties: {
	},
	contents: {
		cells: {
			spec: 'table_cell+',
			title: 'Cells'
		}
	},
	icon: '<b class="icon">row</b>',
	render: function(doc, block) {
		return doc.dom`<tr block-content="cells"></tr>`;
	}
};

Pageboard.elements.table_cell = {
	title: "Cell",
	menu: 'widget',
	properties: {
		align: {
			title: 'Align',
			default: "",
			oneOf: [{
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
	icon: '<b class="icon">cell</b>',
	tag: 'td',
	parse: function(dom) {
		var d = {};
		if (dom.matches('.center')) d.align = 'center';
		else if (dom.matches('.right')) d.align = 'right';
		if (dom.matches('.selectable')) d.selectable = true;
		return d;
	},
	render: function(doc, block) {
		var node = doc.dom`<td></td>`;
		if (block.data.align) node.classList.add(block.data.align, 'aligned');
		if (block.data.selectable) node.classList.add('selectable');
		return node;
	}
};

Pageboard.elements.table_head_cell = {
	title: "Cell",
	menu: 'widget',
	properties: {
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
	icon: '<b class="icon">head</b>',
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
	render: function(doc, block) {
		var node = doc.dom`<th></th>`;
		var pre = Pageboard.elements.grid.prefixes;
		if (block.data.width) node.classList.add(pre[block.data.width], 'wide');
		return node;
	}
};

