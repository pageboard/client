Pageboard.elements.query = {
	title: "Query",
	contents: {
		results: {
			spec: "block*",
			virtual: true
		},
		empty: {
			spec: "block+"
		}
	},
	group: "block",
	icon: '<b class="icon">?</b>',
	render: function(doc, block) {
		var node = doc.dom`<element-query class="ui segment" block-content="results"></element-query>`;
		Object.assign(node.dataset, block.data);
		return node;
	},
	required: ['type'],
	properties: {
		prefix: {
			title: 'Keys prefix',
			description: 'Select only query keys starting with this prefix',
			type: ['string', 'null']
		},
		keys: {
			title: 'Query keys',
			description: 'Space-separated list of query keys (without prefix)',
			type: ['string', 'null']
		},
		type: {
			title: 'Blocks type',
			description: 'Allow only this type of blocks to be returned',
			type: 'string'
		},
		override: {
			title: 'Render blocks as another type',
			type: ['string', 'null']
		},
		limit: {
			title: 'Limit number of results',
			type: 'integer',
			minimum: 1
		}
	},
	stylesheets: [
		'../ui/query.css'
	],
	scripts: [
		'../ui/query.js'
	]
};

