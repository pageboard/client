Pageboard.elements.fetch.install = function() {
	this.dom.classList.add('ui', 'form');
};

Pageboard.elements.fetch_message.install = function(node, d, scope) {
	this.dom.classList.add('ui', 'message');
};
Pageboard.elements.fetch_message.stylesheets.push(
	'../semantic-ui/message.css'
);

Pageboard.elements.query_tags = {
	priority: 10, // must be loaded after query
	title: 'Tags',
	icon: '<i class="tags icon"></i>',
	menu: "form",
	group: "block",
	contents: {
		title: 'inline*'
	},
	html: `<element-query-tags>
		<div block-content="title">Filters:</div>
		<div class="ui labels"></div>
	</element-query-tags>`,
	stylesheets: [
		'../semantic-ui/label.css',
		'../ui/query-tags.css'
	],
	scripts: [
		'../ui/query-tags.js'
	]
};

