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
			"[script.google_analytics]"
		],
		img: [
			"[img.google_analytics]"
		],
		connect: [
			"[connect.google_analytics]"
		]
	},
	scripts: [
		'../ui/gtag.js'
	]
};

exports.input_radio_yes.properties.consent.anyOf.push({
	title: "Statistics",
	const: "statistics"
});

exports.page.fragments.push({
	path: 'head',
	position: 'beforeend',
	html: `<script async is="element-gtm-script" src="https://www.googletagmanager.com/gtag/js?id=[$parent.data.extra?.google_analytics|enc:url|fail:*]">[$parent.data.env|eq:production|prune:*]</script>
	<script async is="element-gtm-script" src="https://www.googletagmanager.com/gtm.js?id=[$parent.data.extra?.google_tag_manager|enc:url|fail:*]">[$parent.data.env|eq:production|prune:*]</script><meta name="google-site-verification" content="[$parent.data.extra?.google_site_verification|fail:*][$pathname|eq:%2F|prune:*]">`
});
