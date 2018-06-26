Pageboard.elements.mail_query = {
	title: "Query",
	menu: "form",
	priority: 1, // scripts must run after 'form' scripts
	contents: {
		template: {
			title: 'Template',
			spec: 'mail_block+'
		}
	},
	group: "mail_block",
	icon: '<i class="search icon"></i>',
	render: function(doc, block) {
		var node = doc.dom`<element-query class="ui form">
			<div><div block-content="template"></div></div>
			<div class="results"></div>
		</element-query>`;
		var d = block.data;
		if (d.query) {
			node.dataset.nocall = !d.query.call;
			if (d.query.type) {
				node.dataset.type = d.query.type;
			}
			if (d.query.vars) {
				node.dataset.vars = Object.keys(d.query.vars).map(function(key) {
					return d.query.vars[key];
				}).join(',');
			}
		}
		return node;
	},
	required: ["query"],
	properties: {
		query: {
			title: 'Query',
			type: 'object',
			properties: {
				call: {
					title: 'Call service',
					description: 'Can be empty to merge only url query',
					anyOf: [{
						type: 'null'
					}, {
						type: "string",
						pattern: "^\\w+\.\\w+$"
					}],
					input: {
					}
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
	stylesheets: Pageboard.elements.query.stylesheets.slice(),
	scripts: Pageboard.elements.query.scripts.slice()
};

Pageboard.elements.mail_query_template = {
	title: "Template",
	properties: {
		fill: {
			title: 'Fill',
			description: 'fill content with matchdom expression, filters on new lines',
			type: 'string',
			input: {
				multiline: true
			}
		},
		attr: {
			title: 'Attribute',
			description: 'set attributes with matchdom expression, filters on new lines',
			type: 'string',
			input: {
				multiline: true
			}
		},
		placeholder: {
			title: 'Placeholder',
			type: 'string'
		}
	},
	context: 'mail_query//',
	inline: true,
	group: "mail_inline",
	icon: '<b class="icon">var</b>',
	render: function(doc, block) {
		var d = block.data;
		var fill = (d.fill || '').trim().split('\n').join('|');
		var ph = d.placeholder || fill.split('|', 1)[0].split('.').pop();
		var node = doc.dom`<span>${ph || '-'}</span>`;
		if (d.attr) node.dataset.attr = `[${d.attr.trim().split('\n').join('|')}]`;
		if (fill) node.dataset.fill = `[${fill}|fill]`;
		return node;
	}
};
