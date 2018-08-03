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
	html: `<element-query>
		<div>
			<div block-content="messages"></div>
			<div block-content="template"></div>
		</div>
		<div class="results"></div>
	</element-query>`,
	fuse: function(node, d) {
		node.dataset.nocall = !d.api;
		if (d.type) {
			node.dataset.type = d.type;
		}
		if (d.vars) {
			node.dataset.vars = Object.keys(d.vars).map(function(key) {
				return d.vars[key];
			}).join(',');
		}
	},
	properties: {
		api: {
			title: 'Api call',
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
				standalone: true
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
	html: '<div class="[type]" block-content="message">Message</div>'
};


Pageboard.elements.query_template = {
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
	context: 'query//',
	inline: true,
	group: "inline nolink",
	icon: '<b class="icon">var</b>',
	html: '<span data-attr="[attr]" data-fill="[fill]">[ph]</span>',
	fuse: function(node, d) {
		var fill = (d.fill || '').trim().split('\n').join('|');
		node.fuse({
			ph: d.placeholder || fill.split('|', 1)[0].split('.').pop() || '-',
			attr: d.attr ? `[${d.attr.trim().split('\n').join('|')}]`: null,
			fill: fill ? `[${fill}|fill]` : null
		});
	}
};
