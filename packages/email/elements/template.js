exports.mail_fetch = Object.assign({}, exports.fetch, {
	group: "mail_block mail_template",
	contents: Object.assign({}, exports.fetch.contents, {
		nodes: 'mail_block+'
	})
});

exports.mail_binding = Object.assign({}, exports.binding, {
	context: 'mail_template//',
	group: "mail_inline"
});

