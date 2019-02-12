Pageboard.elements.site.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	nullable: true,
	type: "string",
	format: "singleline"
};

Pageboard.elements.google_site_verification = {
	group: "block",
	html: '<meta name="google-site-verification" content="[id]">',
	install: function(scope) {
		if (scope.$pathname != "/") return;
		var id = scope.$site.google_site_verification;
		if (!id || scope.$site.env != "production") return;
		scope.$element.dom.querySelector('head').append(this.dom.fuse({id: id}, scope));
	}
};

