exports.site.properties.google_analytics = {
	title: 'Google Analytics ID',
	nullable: true,
	type: 'string',
	pattern: /^(UA-\w+-\d|G-\w+)$/.source
};

exports.site.properties.google_tag_manager = {
	title: 'Google Tag Manager ID',
	nullable: true,
	type: 'string',
	pattern: /^GTM-\w+$/.source
};

exports.google_tag = {
	priority: 10,
	group: "block",
	fragments: [{
		type: 'doc',
		path: 'html > head',
		position: 'beforeend',
		html: `<script async is="element-gtm-script" src="https://www.googletagmanager.com/gtag/js?id=[$site.google_analytics|enc:url|fail:*]">[$site.env|eq:production|prune:*]</script>`
	}, {
		type: 'doc',
		path: 'html > head',
		position: 'beforeend',
		html: `<script async is="element-gtm-script" src="https://www.googletagmanager.com/gtm.js?id=[$site.google_tag_manager|enc:url|fail:*]">[$site.env|eq:production|prune:*]</script>`
	}],
	csp: {
		img: [
			"https://*.google-analytics.com",
			"https://*.googletagmanager.com"
		],
		connect: [
			"https://*.google-analytics.com",
			"https://*.analytics.google.com",
			"https://*.googletagmanager.com",
			"https://*.g.doubleclick.net"
		],
		script: [
			"https://*.googletagmanager.com"
		]
	},
	scripts: [
		'../ui/gtag.js'
	]
};
