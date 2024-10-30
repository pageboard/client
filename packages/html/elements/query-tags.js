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
		<div class="title" block-content="title">Filters:</div>
		<div class="ui labels"></div>
	</element-query-tags>`,
	stylesheets: [
		'../ui/components/label.css',
		'../ui/query-tags.css'
	],
	scripts: [
		'../ui/query-tags.js'
	]
};
