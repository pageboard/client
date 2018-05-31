Pageboard.elements.rating = {
	title: "Rating",
	menu: 'widget',
	group: "block",
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
		icon: {
			title: 'Icon',
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
		var node = doc.dom`<element-rating class="ui ${d.icon || ''} rating" value="${d.value}" maximum="${d.maximum}"></element-rating>`;
		if (d.template) node.dataset.value = d.template;
		return node;
	},
	stylesheets: [
		'../semantic-ui/rating.css'
	],
	scripts: [
		'../ui/rating.js'
	]
};

