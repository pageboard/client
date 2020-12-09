exports.site.properties.google_analytics = {
	title: 'Google Analytics ID',
	nullable: true,
	type: 'string',
	pattern: '^(UA-\\w+-\\d|G-\\w+)$'
};

exports.site.properties.google_tag_manager = {
	title: 'Google Tag Manager ID',
	nullable: true,
	type: 'string',
	pattern: '^GTM-\\w+$'
};

exports.google_tag = {
	priority: 10,
	group: "block",
	fragments: [{
		type: 'doc',
		path: 'html > head',
		position: 'beforeend',
		html: `<script async src="https://www.googletagmanager.com/gtag/js?id=[$site.google_analytics|url|magnet:*]">[$site.env|eq:production|bmagnet:*]</script>`
	}, {
		type: 'doc',
		path: 'html > head',
		position: 'beforeend',
		html: `<script async src="https://www.googletagmanager.com/gtm.js?id=[$site.google_tag_manager|url|magnet:*]">[$site.env|eq:production|bmagnet:*]</script>`
	}],
	csp: {
		connect: ["https://www.google-analytics.com"],
		img: ["https://www.google-analytics.com"],
		script: ["https://www.googletagmanager.com", "https://www.google-analytics.com", "https://ssl.google-analytics.com"]
	},
	scripts: [
		'../ui/gtag.js'
	]
};
