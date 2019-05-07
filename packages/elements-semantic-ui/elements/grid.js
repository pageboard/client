exports.grid = {
	title: "Grid",
	icon: '<i class="icon grid layout"></i>',
	group: "block",
	contents: {
		columns: {
			spec: "(grid_column|grid_row)+",
			title: 'cells'
		}
	},
	properties: {
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
		}
	},
	html: '<div class="ui doubling stackable equal width grid [width|eq:contained:container]" block-content="columns"></div>',
	stylesheets: [
		'../lib/components/grid.css'
	]
};


exports.grid_column = {
	title: "Column",
	icon: '<i class="icon columns"></i>',
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
	html: '<div class="[width|num: wide] column" block-content="content"></div>'
};

exports.grid_row = {
	title: "Row",
	icon: '<b class="icon">row</b>',
	contents: {
		columns: {
			spec: "grid_column+",
			title: 'columns'
		}
	},
	html: '<div class="row" block-content="columns"></div>'
};
