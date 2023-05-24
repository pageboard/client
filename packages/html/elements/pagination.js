exports.pagination = {
	priority: 13, // after fetch and after menu items
	title: "Pagination",
	icon: '<b class="icon">±N</b>',
	menu: "link",
	group: "block",
	isolating: true,
	properties: {
		fetch: {
			title: 'Fetch block',
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
