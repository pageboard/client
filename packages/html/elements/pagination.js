exports.pagination = {
	title: "Pagination",
	priority: 13, // after fetch and after menu items
	icon: '<b class="icon">±N</b>',
	menu: "link",
	group: "block",
	isolating: true,
	properties: {
		fetch: {
			title: 'Name of fetch block',
			type: 'string',
			format: 'id',
			$filter: {
				name: 'action',
				action: 'read'
			}
		},
		dir: {
			title: 'Direction',
			anyOf: [{
				const: '-',
				title: 'Backward'
			}, {
				const: '+',
				title: 'Forward'
			}],
			default: '+'
		},
	},
	contents: "inline*",
	html: `<a class="ui button pagination" is="element-pagination" data-dir="[dir]" data-fetch="[fetch]">[dir|switch:+:Next:-:Prev]</a>`,
	scripts: [
		'../ui/pagination.js'
	]
};
