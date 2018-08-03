Pageboard.elements.mail_query = Object.assign({}, Pageboard.elements.query, {
	contents: {
		template: {
			title: 'Template',
			spec: 'mail_block+'
		}
	},
	group: "mail_block"
});
Pageboard.elements.mail_query.fuse = function(node, d) {
	node.fuse(d);
	node.querySelector('[block-content="messages"]').remove();
};

Pageboard.elements.mail_query_template = Object.assign({}, Pageboard.elements.query_template, {
	context: 'mail_query//',
	group: "mail_inline"
});

