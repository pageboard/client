Pageboard.elements.mail_query = Object.assign({}, Pageboard.elements.query, {
	contents: {
		template: {
			title: 'Template',
			spec: 'mail_block+'
		}
	},
	group: "mail_block",
	priority: 2
});
Pageboard.elements.mail_query._render = Pageboard.elements.query.render;
Pageboard.elements.mail_query.render = function(doc, block) {
	var node = Pageboard.elements.mail_query._render(doc, block);
	node.classList.remove('ui', 'form');
	node.querySelector('[block-content="messages"]').remove();
	return node;
};

Pageboard.elements.mail_query_template = Object.assign({}, Pageboard.elements.query_template, {
	context: 'mail_query//',
	group: "mail_inline"
});

