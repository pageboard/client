Pageboard.elements.rating = {
	title: "Rating",
	icon: '<i class="star outline icon"></i>',
	menu: 'widget',
	group: "block",
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
		template: {
			title: 'Template',
			description: 'Query template',
			type: 'string',
			context: 'query|form'
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
				type: 'null'
			}, {
				title: 'Star',
				const: "star"
			}, {
				title: 'Heart',
				const: "heart"
			}]
		}
	},
	html: '<element-rating class="[color]" value="[value]" maximum="[maximum]" char="[char]" data-value="[template|magnet]"></element-rating>',
	stylesheets: [
		'../ui/rating.css'
	],
	scripts: [
		'../ui/rating.js'
	]
};

