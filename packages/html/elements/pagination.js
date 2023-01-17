exports.pagination = {
	priority: 13, // after fetch and after menu items
	title: "Pagination",
	icon: '<b class="icon">±N</b>',
	menu: "link",
	context: 'menu//',
	group: "menu_item",
	properties: {
		fetch: {
			title: 'Fetch block',
			type: 'string',
			format: 'id',
			$filter: {
				name: 'block',
				types: ["fetch"]
			}
		},
		dir: {
			title: 'Direction',
			anyOf: [{
				const: '-',
				title: 'Previous'
			}, {
				const: '+',
				title: 'Next'
			}],
			default: '+'
		},
		infinite: {
			title: 'Infinite loading',
			type: 'boolean',
			default: false
		}
	},
	contents: "inline*",
	html: `<a class="item" is="element-pagination" data-dir="[dir]" data-fetch="[fetch]" data-infinite="[infinite]"></a>`,
	stylesheets: [
		'../ui/pagination.css'
	],
	scripts: [
		'../ui/pagination.js'
	]
};
