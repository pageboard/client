exports.fetch.install = function() {
	this.dom.classList.add('ui');
};
exports.message.install = function(node, d, scope) {
	this.dom.classList.add('ui', '[inverted|?]');
};
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

