exports.site.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	nullable: true,
	type: "string",
	format: "singleline"
};

exports.google_site_verification = {
	group: "block",
	fragments: [{
		type: 'doc',
		path: 'html > head > meta',
		position: 'afterend',
		html: `<meta name="google-site-verification" content="[$site.google_site_verification|fail:*][$page.data.url|eq:%2F|prune:*]">`
	}]
};
