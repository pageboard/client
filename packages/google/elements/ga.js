exports.site.properties.google_analytics = {
	title: 'Google Analytics ID',
	nullable: true,
	type: 'string',
	pattern: '^UA-\\w+-\\d$'
};

exports.google_analytics = {
	priority: 10,
	group: "block",
	html: `<meta name="ga" content="[$site.google_analytics|magnet]">`,
	install: function(scope) {
		if (scope.$site.env != "production") return;
		scope.$element.dom.querySelector('head > meta').after(this.dom);
	},
	csp: {
		connect: ["https://www.google-analytics.com/collect"]
	},
	scripts: [
		'../ui/ga.js'
	]
};

