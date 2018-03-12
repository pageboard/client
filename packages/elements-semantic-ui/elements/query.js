Pageboard.elements.query = {
	title: "Query",
	menu: "form",
	priority: 1, // scripts must run after 'form' scripts
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
			<div>
				<div block-content="messages"></div>
				<div block-content="template"></div>
			</div>
			<div class="results"></div>
		</element-query>`;
		var d = block.data;
		if (d.query) {
			if (d.query.type) {
				node.dataset.type = d.query.type;
			}
			if (d.query.vars) {
				node.dataset.vars = Object.keys(d.query.vars).map(function(key) {
					return d.query.vars[key];
				}).join(',');
			}
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
					anyOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "list of path.to.key -> query.key",
					anyOf: [{
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
		'../ui/lib/matchdom.js',
		'../ui/query.js'
	],
	polyfills: [
		'fetch'
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
			anyOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "warning",
				title: "Not found"
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

