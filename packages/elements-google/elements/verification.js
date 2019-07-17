exports.site.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	nullable: true,
	type: "string",
	format: "singleline"
};

exports.google_site_verification = {
	group: "block",
	html: '<meta name="google-site-verification" content="[$site.google_site_verification|magnet:*][$page.data.url|eq:%2F|bmagnet:*]">',
	install: function(scope) {
		scope.$element.dom.querySelector('head > meta').after(this.dom);
	}
};

