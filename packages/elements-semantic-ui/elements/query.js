Pageboard.elements.query._fuse = Pageboard.elements.query.fuse;
Pageboard.elements.query.fuse = function(node, d) {
	this._fuse(node, d);
	node.classList.add('ui', 'form');
};

Pageboard.elements.query_message.fuse = function(node, d) {
	node.fuse(d);
	node.classList.add('ui', 'message');
};
Pageboard.elements.query_message.stylesheets.push(
	'../semantic-ui/message.css'
);

Pageboard.elements.query_tags = {
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

