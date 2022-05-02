exports.grid = {
	title: "Grid",
	icon: '<i class="icon grid layout"></i>',
	group: "block",
	contents: "(grid_column|grid_row)+",
	properties: {
		width: {
			title: 'Width',
			anyOf: [{
				type: 'null',
				title: 'normal'
			}, {
				const: "min",
				title: "minimal"
			}, {
				const: "full",
				title: "maximal"
			}, {
				const: "contained",
				title: "contained"
			}]
		},
		responsive: {
			title: 'Responsive',
			anyOf: [{
				title: 'No',
				type: 'null'
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
	html: '<div class="ui [responsive] [width|neq:min:equal width:] [columns|num: columns] grid [width|eq:contained:container]"></div>',
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
			anyOf: [{
				title: 'No',
				type: 'null'
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
	html: '<div class="[responsive] [columns|num: columns] row"></div>'
};
