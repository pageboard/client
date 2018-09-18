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
	install: function(doc, page, scope) {
		if (page.data.url != "/") return;
		var id = scope.$site.google_site_verification;
		if (!id || scope.$site.env != "production") return;
		doc.head.appendChild(
			doc.dom('<meta name="google-site-verification" content="[id]">').fuse({id: id})
		);
	}
};

