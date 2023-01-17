exports.fetch.fragments.push({
	attributes: {
		className: "ui"
	}
});

exports.message.fragments.push({
	attributes: {
		className: '[inverted|?]'
	}
});

exports.message.properties.inverted = {
	title: 'Inverted',
	type: 'boolean',
	default: false
};
exports.message.stylesheets.unshift(
	'../lib/components/message.css'
);

exports.query_tags = {
	priority: 10, // after fetch
	title: 'Tags',
	icon: '<i class="tags icon"></i>',
	menu: "form",
	group: "block",
	properties: {
		form: {
			title: 'Form name',
			type: 'string',
			format: 'id',
			nullable: true
		}
	},
	contents: {
		id: 'title',
		nodes: 'inline*'
	},
	html: `<element-query-tags for="[form]">
		<div block-content="title">Filters:</div>
		<div class="ui labels"></div>
	</element-query-tags>`,
	stylesheets: [
		'../lib/components/label.css',
		'../ui/query-tags.css'
	],
	scripts: [
		'../ui/query-tags.js'
	]
};

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
