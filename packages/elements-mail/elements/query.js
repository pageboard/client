Pageboard.elements.mail_query = Object.assign({}, Pageboard.elements.query, {
	group: "mail_block",
	contents: {
		template: {
			title: 'Template',
			spec: 'mail_block+'
		},
		view: {
			title: 'View',
			spec: 'mail_block+',
			virtual: true
		}
	}
});

Pageboard.elements.mail_query_template = Object.assign({}, Pageboard.elements.query_template, {
	context: 'mail_query//',
	group: "mail_inline"
});

