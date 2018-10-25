Pageboard.elements.site.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	anyOf: [{
		type: "null"
	}, {
		type: "string",
		format: "singleline"
	}]
};

Pageboard.elements.google_site_verification = {
	html: '<meta name="google-site-verification" content="[id]">',
	install: function(scope) {
		if (scope.$pathname != "/") return;
		var id = scope.$site.google_site_verification;
		if (!id || scope.$site.env != "production") return;
		var pageEl = scope.$elements[scope.$page.type];
		pageEl.dom.querySelector('head').append(this.dom.fuse({id: id}));
	}
};

