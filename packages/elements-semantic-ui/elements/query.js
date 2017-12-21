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
		if (d.query) Object.assign(node.dataset, d.query.vars);
		if (d.type) {
			node.dataset.type = d.type;
		}
		return node;
	},
	required: ["action"],
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
				consts: {
					title: 'Constants',
					description: 'Server input',
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "Client input",
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				}
			}
		},
		type: {
			title: 'Render to type',
			description: 'Use this element type to render response',
			oneOf: [{
				type: 'null'
			}, {
				type: 'string',
				pattern: "^\\w+$"
			}]
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

