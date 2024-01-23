exports.mail_hard_break = {
	...exports.hard_break,
	name: 'hard_break',
	group: "mail_inline"
};

exports.mail_strong = {
	...exports.strong,
	excludes: 'mail_light',
	group: "mail_inline"
};

exports.mail_em = {
	...exports.em,
	group: "mail_inline"
};

exports.mail_light = {
	...exports.light,
	excludes: 'mail_strong',
	group: "mail_inline"
};

exports.mail_sup = {
	...exports.sup,
	excludes: 'mail_sub',
	group: "mail_inline"
};

exports.mail_sub = {
	...exports.sub,
	excludes: 'mail_sup',
	group: "mail_inline"
};

exports.mail_style = {
	...exports.style,
	group: "mail_inline"
};

exports.mail_caps = {
	...exports.caps,
	group: "mail_inline"
};

exports.mail_color = {
	...exports.color,
	group: "mail_color"
};

exports.mail_notranslate = {
	...exports.notranslate,
	group: "mail_inline"
};

