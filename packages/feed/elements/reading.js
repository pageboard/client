exports.reading = {
	title: 'Blog',
	priority: 10,
	icon: '<i class="clock outline icon"></i>',
	required: ["for"],
	inline: true,
	group: 'inline',
	inplace: true,
	properties: {
		for: {
			title: 'For',
			type: "string",
			format: "singleline"
		}
	},
	html: `<element-reading data-for="[for]"></element-reading>`,
	scripts: ['../ui/reading.js'],
	stylesheets: ['../ui/reading.css']
};

