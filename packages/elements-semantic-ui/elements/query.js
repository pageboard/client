Pageboard.elements.query = {
	title: "Query",
	menu: "form",
	contents: {
		messages: {
			spec: '(paragraph|form_message)+'
		},
		results: {
			title: 'Results',
			spec: "block*",
			virtual: true
		}
	},
	group: "block",
	icon: '<i class="search icon"></i>',
	render: function(doc, block) {
		var node = doc.dom`<element-query class="ui form">
			<div block-content="messages"></div>
			<div block-content="results"></div>
		</element-query>`;
		var d = block.data;
		if (d.query && d.query.type) {
			node.dataset.type = d.query.type;
		}
		return node;
	},
	required: ["query"],
	properties: {
		query: {
			title: 'Query',
			type: 'object',
			required: ["call"],
			properties: {
				call: {
					title: 'Call api or url',
					type: "string",
					pattern: "^(\\w+\.\\w+)|((/[\\w-.]*)+)$"
				},
				type: {
					title: 'Bind to element',
					description: 'Checks schema and renders it',
					type: ['null', 'string'],
					input: {
						name: 'element'
					}
				},
				consts: {
					title: 'Constants',
					description: 'list of path.to.key -> value',
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "list of path.to.key -> query.key",
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				}
			}
		}
	},
	stylesheets: [
		'../ui/query.css'
	],
	scripts: [
		'/.api/elements.js',
		'../ui/query.js'
	]
};

