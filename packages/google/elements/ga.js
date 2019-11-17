exports.site.properties.google_analytics = {
	title: 'Google Analytics ID',
	nullable: true,
	type: 'string',
	pattern: '^UA-\\w+-\\d$'
};

exports.google_analytics = {
	priority: 10,
	group: "block",
	html: `<script async src="https://www.googletagmanager.com/gtag/js?id=[id|url]"></script>`,
	install: function(scope) {
		var id = scope.$site.google_analytics;
		if (!id || scope.$site.env != "production") return;
		scope.$element.dom.querySelector('head').append(this.dom.fuse({id: id}, scope));
	},
	csp: {
		script: ["https://www.googletagmanager.com", "https://www.google-analytics.com"],
		img: ["https://www.googletagmanager.com", "https://www.google-analytics.com", "https://stats.g.doubleclick.net"]
	},
	scripts: [
		'../ui/ga.js'
	]
};

