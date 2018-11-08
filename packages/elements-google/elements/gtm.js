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
	html: `<script async src="https://www.googletagmanager.com/gtm.js?id=[id|url]"></script>`,
	install: function(scope) {
		var id = scope.$site.google_tag_manager;
		if (!id || scope.$site.env != "production") return;
		scope.$element.dom.querySelector('head').append(this.dom.fuse({id: id}));
	},
	scripts: [
		'../ui/gtm.js'
	]
};

