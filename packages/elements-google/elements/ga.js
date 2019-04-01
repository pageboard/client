Pageboard.elements.site.properties.google_analytics = {
	title: 'Google Analytics ID',
	anyOf: [{
		type: 'null'
	}, {
		type: 'string',
		pattern: '^UA-\\w+-\\d$'
	}]
};

Pageboard.elements.google_analytics = {
	install: function(doc, page, scope) {
		var id = Pageboard.site.google_analytics;
		if (!id || Pageboard.site.env != "production") return;
		doc.head.insertAdjacentHTML('beforeEnd', `
	<script async src="https://www.googletagmanager.com/gtag/js?id=${id}></script>`);
	},
	scripts: [
		'../ui/ga.js'
	]
};

