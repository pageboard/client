Pageboard.elements.query._render = Pageboard.elements.query.render;
Pageboard.elements.query.render = function(doc, block) {
	var node = Pageboard.elements.query._render(doc, block);
	node.classList.add('ui', 'form');
	return node;
};

Pageboard.elements.query_message._render = Pageboard.elements.query_message.render;
Pageboard.elements.query_message.render = function(doc, block) {
	var node = Pageboard.elements.query_message._render(doc, block);
	node.classList.add('ui', 'message');
	return node;
};
Pageboard.elements.query_message.stylesheets.push(
	'../semantic-ui/message.css'
);

Pageboard.elements.query_tags = {
	priority: 10, // must be loaded after query
	title: 'Tags',
	menu: "form",
	group: "block",
	contents: {
		title: 'inline*'
	},
	icon: '<i class="tags icon"></i>',
	render: function(doc, block) {
		return doc.dom`<element-query-tags>
			<div block-content="title">Filters:</div>
			<div class="ui labels"></div>
		</element-query-tags>`
	},
	stylesheets: [
		'../semantic-ui/label.css',
		'../ui/query-tags.css'
	],
	scripts: [
		'../ui/query-tags.js'
	]
};

