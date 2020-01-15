exports.site.properties.google_tag_manager = {
	title: 'Google Tag Manager ID',
	nullable: true,
	type: 'string',
	pattern: '^GTM-\\w+$'
};

exports.google_tag_manager = {
	priority: 10,
	group: "block",
	html: `<script async src="https://www.googletagmanager.com/gtm.js?id=[id|url]"></script>`,
	install: function(scope) {
		if (!scope.$site) return;
		var id = scope.$site.google_tag_manager;
		if (!id || scope.$site.env != "production") return;
		scope.$element.dom.querySelector('head').append(this.dom.fuse({id: id}, scope));
	},
	csp: {
		script: ["https://www.googletagmanager.com", "https://www.google-analytics.com"],
		img: ["https://www.googletagmanager.com", "https://www.google-analytics.com", "https://stats.g.doubleclick.net"]
	},
	scripts: [
		'../ui/gtm.js'
	]
};

