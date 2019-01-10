Pageboard.elements.mail_template = Object.assign({}, Pageboard.elements.template, {
	group: "mail_block mail_template",
	contents: {
		template: {
			title: 'Template',
			spec: 'mail_block+',
			expressions: true
		}
	}
});

Pageboard.elements.mail_fetch = Object.assign({}, Pageboard.elements.fetch, {
	group: Pageboard.elements.mail_template.group,
	contents: Pageboard.elements.mail_template.contents
});

Pageboard.elements.mail_binding = Object.assign({}, Pageboard.elements.binding, {
	context: 'mail_template//',
	group: "mail_inline"
});

