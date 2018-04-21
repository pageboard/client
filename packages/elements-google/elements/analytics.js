Pageboard.elements.site.properties.ga_tracking_id = {
	title: 'Google Analytics Tracking Code',
	type: 'string',
	pattern: '^UA-\\d+-\\d+$'
};

Pageboard.elements.google_analytics = {
	install: function(doc, page) {
		var gaid = page.site.ga_tracking_id;
		if (!gaid || page.site.env != "production") return;
		// FIXME we do not have a way to tell page.render we want an async script here
		doc.head.insertAdjacentHTML('beforeEnd', `
	<script async src="https://www.googletagmanager.com/gtag/js?id=${gaid}" id="gtag"></script>`);
		this.scripts = this.resources;
	},
	resources: [`../ui/analytics.js`]
};

