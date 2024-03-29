exports.rating = {
	title: "Rating",
	icon: '<i class="star outline icon"></i>',
	menu: 'widget',
	inline: true,
	group: "inline",
	properties: {
		value: {
			title: 'Value',
			type: 'integer',
			minimum: 0,
			default: 0
		},
		maximum: {
			title: 'Maximum',
			type: 'integer',
			default: 4
		},
		char: {
			title: 'Symbol',
			type: 'string',
			maxLength: 1,
			minLength: 1,
			default: '⭐'
		},
		color: {
			title: 'Color',
			anyOf: [{
				title: 'Default',
				const: null
			}, {
				title: 'Star',
				const: "star"
			}, {
				title: 'Heart',
				const: "heart"
			}]
		}
	},
	html: '<element-rating class="[color]" data-value="[value]" data-maximum="[maximum]" data-char="[char]"></element-rating>',
	stylesheets: [
		'../ui/rating.css'
	],
	scripts: [
		'../ui/rating.js'
	]
};

