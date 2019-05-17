Pageboard.elements.rating = {
	title: "Rating",
	menu: 'widget',
	inline: true,
	group: "inline",
	icon: '<i class="star outline icon"></i>',
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
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<element-rating class="${d.color || ''}" value="${d.value}" maximum="${d.maximum}" char="${d.char}"></element-rating>`;
		if (d.template) node.dataset.value = d.template;
		return node;
	},
	stylesheets: [
		'../ui/rating.css'
	],
	scripts: [
		'../ui/rating.js'
	]
};

