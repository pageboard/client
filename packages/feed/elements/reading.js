exports.reading = {
	title: 'Reading',
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
		},
		speed: {
			title: 'Speed',
			description: 'Words per minute',
			type: 'integer',
			minimum: 100,
			maximum: 300,
			default: 200
		}
	},
	html: `<element-reading data-for="[for]" data-speed="[speed]"></element-reading>`,
	scripts: ['../ui/reading.js'],
	stylesheets: ['../ui/reading.css']
};

