exports.pagination = {
	priority: 13, // after fetch and after menu items
	title: "Pagination",
	icon: '<b class="icon">±N</b>',
	menu: "link",
	context: 'menu//',
	group: "menu_item",
	properties: {
		name: {
			title: 'Offset name',
			description: 'Query parameter used by fetch block',
			type: 'string',
			format: 'id',
			default: 'offset'
		},
		value: {
			title: 'Offset value',
			description: 'Integer, can be negative',
			type: 'integer',
			default: 10
		},
		infinite: {
			title: 'Infinite loading',
			type: 'boolean',
			default: false
		}
	},
	contents: "inline*",
	html: `<a class="item" is="element-pagination" data-name="[name]" data-value="[value]" data-infinite="[infinite]"></a>`,
	stylesheets: [
		'../ui/pagination.css'
	],
	scripts: [
		'../ui/pagination.js'
	]
};
