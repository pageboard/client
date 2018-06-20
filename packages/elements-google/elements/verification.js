Pageboard.elements.site.properties.google_site_verification = {
	title: 'Google Site Verification Code',
	type: ['string', 'null']
};

Pageboard.elements.google_site_verification = {
	install: function(doc, page) {
		var id = Pageboard.site.google_site_verification;
		if (!id || Pageboard.site.env != "production") return;
		doc.head.appendChild(doc.dom`<meta name="google-site-verification" content="${id}">`);
	}
};

