Pageboard.elements.site.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	anyOf: [{
		type: "null"
	}, {
		type: "string"
	}]
};

Pageboard.elements.google_site_verification = {
	install: function(doc, page) {
		if (page.data.url != "/") return;
		var id = Pageboard.site.google_site_verification;
		if (!id || Pageboard.site.env != "production") return;
		doc.head.insertAdjacentHTML('beforeEnd', `<meta name="google-site-verification" content="${id}">`);
	}
};

