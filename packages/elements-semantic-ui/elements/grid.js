Pageboard.elements.grid = {
	title: "Grid",
	group: "block",
	contents: {
		columns: {
			spec: "(grid_column|grid_row)+",
			title: 'cells'
		}
	},
	icon: '<i class="icon grid layout"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="ui doubling stackable equal width grid" block-content="columns"></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/grid.css'
	],
	prefixes: {
		0: '',
		1: 'one',
		2: 'two',
		3: 'three',
		4: 'four',
		5: 'five',
		6: 'six',
		7: 'seven',
		8: 'eight',
		9: 'nine',
		10: 'ten',
		11: 'eleven',
		12: 'twelve',
		13: 'thirteen',
		14: 'fourteen',
		15: 'fifteen',
		16: 'sixteen'
	}
};


Pageboard.elements.grid_column = {
	title: "Column",
	properties: {
		width: {
			title: 'Column width',
			description: 'Between 1 and 16, set to 0 for auto',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		}
	},
	contents: {
		content: {
			spec: "block+|card",
			title: 'content'
		}
	},
	icon: '<i class="icon columns"></i>',
	render: function(doc, block) {
		var prefix = '';
		if (block.data.width != null) prefix = Pageboard.elements.grid.prefixes[block.data.width];
		if (prefix) prefix += " wide ";
		return doc.dom`<div class="${prefix}column" block-content="content"></div>`;
	}
};

Pageboard.elements.grid_row = {
	title: "Row",
	contents: {
		columns: {
			spec: "grid_column+",
			title: 'columns'
		}
	},
	icon: '<b class="icon">row</b>',
	render: function(doc, block) {
		return doc.dom`<div class="row" block-content="columns"></div>`;
	}
};
