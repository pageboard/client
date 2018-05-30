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
		}
	},
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<div class="ui star rating">${
			(new Array(d.value + 1)).join('<i class="icon active"></i>') +
			(new Array(d.maximum + 1)).join('<i class="icon"></i>')
		}</div>`;
	},
	stylesheets: [
		'../semantic-ui/rating.css'
	]
};

