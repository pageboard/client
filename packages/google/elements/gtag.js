exports.site.properties.extra.properties.google_analytics = {
	title: 'Google Analytics ID',
	nullable: true,
	type: 'string',
	pattern: /^(UA-\w+-\d|G-\w+)$/.source
};

exports.site.properties.extra.properties.google_tag_manager = {
	title: 'Google Tag Manager ID',
	nullable: true,
	type: 'string',
	pattern: /^GTM-\w+$/.source
};

exports.site.properties.extra.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	nullable: true,
	type: "string",
	format: "singleline"
};

exports.google_tag = {
	group: "block",
	priority: 10,
	csp: {
		script: [
			"[$commons.csp.script.google_analytics]"
		],
		img: [
			"[$commons.csp.img.google_analytics]"
		],
		connect: [
			"[$commons.csp.connect.google_analytics]"
		]
	},
	scripts: [
		'../ui/gtag.js'
	]
};
