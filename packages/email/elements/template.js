exports.mail_template = Object.assign({}, exports.template, {
	group: "mail_block mail_template",
	contents: Object.assign({}, exports.template.contents, {
		nodes: 'mail_block+'
	})
});

exports.mail_fetch = Object.assign({}, exports.fetch, {
	group: exports.mail_template.group,
	contents: exports.mail_template.contents
});

exports.mail_binding = Object.assign({}, exports.binding, {
	context: 'mail_template//',
	group: "mail_inline"
});

