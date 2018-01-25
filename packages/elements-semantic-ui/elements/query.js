Pageboard.elements.query = {
	title: "Query",
	menu: "form",
	priority: -1,
	contents: {
		messages: {
			title: 'Messages',
			spec: '(paragraph|query_message)+'
		},
		template: {
			title: 'Template',
			spec: 'block+'
		}
	},
	group: "block",
	icon: '<i class="search icon"></i>',
	render: function(doc, block) {
		var node = doc.dom`<element-query class="ui form">
			<div block-content="messages"></div>
			<div block-content="template"></div>
		</element-query>`;
		var d = block.data;
		var type = d.query && d.query.type;
		if (type) {
			node.dataset.type = type;
		}
		if (d.binding) {
			node.dataset.binding = d.binding;
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
					title: 'Which element',
					description: 'Checks query against schema',
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
		binding: {
			title: 'Binding',
			type: ['null', 'string'],
			input: {
				name: 'binding'
			}
		}
	},
	stylesheets: [
		'../ui/query.css'
	],
	scripts: [
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
				const: "warning",
				title: "Warning"
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

