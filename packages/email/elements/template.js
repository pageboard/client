exports.mail_fetch = { ...exports.fetch,
	group: "mail_block mail_template",
	contents: { ...exports.fetch.contents,
		nodes: 'mail_block+'
	}
};

exports.mail_binding = { ...exports.binding,
	context: 'mail_template//',
	group: "mail_inline",
	tag: 'span[block-type="mail_binding"]'
};
