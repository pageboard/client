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
		}
	},
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<div class="ui star rating">${
			(new Array(d.value + 1)).join('<i class="icon active"></i>') +
			(new Array(d.maximum + 1)).join('<i class="icon"></i>')
		}</div>`;
		if (d.template) node.dataset.value = d.template;
		return node;
	},
	stylesheets: [
		'../semantic-ui/rating.css'
	]
};

