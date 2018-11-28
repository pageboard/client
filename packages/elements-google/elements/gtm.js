Pageboard.elements.site.properties.google_tag_manager = {
	title: 'Google Tag Manager ID',
	anyOf: [{
		type: 'null'
	}, {
		type: 'string',
		pattern: '^GTM-\\w+$'
	}]
};

Pageboard.elements.google_tag_manager = {
	install: function(doc, page, scope) {
		var id = Pageboard.site.google_tag_manager;
		if (!id || Pageboard.site.env != "production") return;
		doc.head.insertAdjacentHTML('beforeEnd', `
	<script async src="https://www.googletagmanager.com/gtm.js?id=${id}" id="gtag"></script>`);
	},
	scripts: [
		'../ui/gtm.js'
	]
};

