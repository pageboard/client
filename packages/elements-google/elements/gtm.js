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
		var id = scope.$site.google_tag_manager;
		if (!id || scope.$site.env != "production") return;
		// FIXME we do not have a way to tell page.render we want an async script here
		doc.head.appendChild(doc.dom(
			'<script async src="https://www.googletagmanager.com/gtm.js?id=[id|url]" id="gtag"></script>'
		).fuse({id: id}));
	},
	scripts: [
		'../ui/gtm.js'
	]
};

