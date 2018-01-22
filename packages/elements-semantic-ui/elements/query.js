Pageboard.elements.query = {
	title: "Query",
	menu: "form",
	contents: {
		messages: {
			spec: '(paragraph|query_message)+'
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
		var type = d.render && d.render.type || d.query && d.query.type;
		if (type) {
			node.dataset.type = type;
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
					description: 'Checks schema and defaults rendering',
					type: ['null', 'string'],
					input: {
						name: 'element',
						properties: true
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
		},
		render: {
			title: 'Render',
			type: 'object',
			properties: {
				type: {
					title: 'As element',
					type: ['null', 'string'],
					input: {
						name: 'element'
					}
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

Pageboard.elements.query_message = {
	title: 'Message',
	menu: "form",
	group: "block",
	context: 'query//',
	properties: {
		type: {
			title: "type",
			description: "Message is shown depending on type",
			default: "success",
			oneOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "info",
				title: "Info"
			}, {
				const: "error",
				title: "Error"
			}]
		}
	},
	contents: {
		message: {
			title: 'Message',
			spec: "block+"
		}
	},
	icon: '<i class="announcement icon"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="ui message ${block.data.type}" block-content="message">Message</div>`
	},
	stylesheets: [
		'../semantic-ui/message.css'
	]
};

Pageboard.elements.query_tags = {
	title: 'Tags',
	menu: "form",
	group: "block",
	contents: {
		title: 'inline*'
	},
	icon: '<i class="tags icon"></i>',
	render: function(doc, block) {
		return doc.dom`<element-query-tags>
			<div block-content="title">Filters:</div>
			<div class="ui labels"></div>
		</element-query-tags>`
	},
	stylesheets: [
		'../semantic-ui/label.css'
	],
	scripts: [
		'../ui/query.js'
	]
};

