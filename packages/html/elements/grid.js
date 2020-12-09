exports.grid = {
	title: "Grid",
	icon: '<i class="icon grid layout"></i>',
	group: "block",
	contents: "(grid_column|grid_row)+",
	properties: {
		width: {
			title: 'Width',
			default: "full",
			anyOf: [{
				const: "full",
				title: "full"
			}, {
				const: "contained",
				title: "container"
			}]
		},
		responsive: {
			title: 'Responsive',
			nullable: true,
			anyOf: [{
				title: 'Stackable',
				const: 'stackable'
			}, {
				title: 'Doubling',
				const: 'doubling'
			}],
			default: 'stackable'
		},
		columns: {
			title: 'Columns Count',
			description: 'Between 1 and 16, set to 0 to unknown - works well with doubling',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		}
	},
	html: '<div class="ui [responsive] equal width [columns|num: columns] grid [width|eq:contained:container]"></div>',
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
	properties: {
		responsive: {
			title: 'Responsive',
			nullable: true,
			anyOf: [{
				title: 'Disable',
				const: null
			}, {
				title: 'Stackable',
				const: 'stackable'
			}, {
				title: 'Doubling',
				const: 'doubling'
			}],
			default: 'stackable'
		},
		columns: {
			title: 'Columns Count',
			description: 'Between 1 and 16, set to 0 to unknown - works well with doubling',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		}
	},
	html: '<div class="[responsive] equal width [columns|num: columns] row"></div>'
};
