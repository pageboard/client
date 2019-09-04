exports.grid = {
	title: "Grid",
	icon: '<i class="icon grid layout"></i>',
	group: "block",
	contents: "(grid_column|grid_row)+",
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
	html: '<div class="ui doubling stackable equal width grid [width|eq:contained:container]"></div>',
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
	contents: "block+|card",
	html: '<div class="[width|num: wide] column"></div>'
};

exports.grid_row = {
	title: "Row",
	icon: '<b class="icon">row</b>',
	contents: "grid_column+",
	html: '<div class="row"></div>'
};
