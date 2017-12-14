Pageboard.elements.query = {
	title: "Query",
	menu: "form",
	contents: {
		blocks: {
			title: 'Results',
			spec: "block*",
			virtual: true
		},
		empty: {
			title: 'Empty',
			spec: "block+"
		},
		error: {
			title: 'Error',
			spec: "block+"
		}
	},
	group: "block",
	icon: '<i class="search icon"></i>',
	render: function(doc, block) {
		var node = doc.dom`<element-query>
			<div block-content="empty" class="ui message hidden"></div>
			<div block-content="error" class="ui error message hidden"></div>
			<div block-content="blocks"></div>
		</element-query>`;
		var d = block.data;
		Object.assign(node.dataset, d.vars);
		if (d.type) {
			node.dataset.type = d.type;
		}
		return node;
	},
	required: ["call"],
	properties: {
		call: {
			title: 'Call api or url#accessor',
			type: "string",
			pattern: "^(\\w+\.\\w+)|((/[\\w-.]*)+)$"
		},
		consts: {
			title: 'Constants',
			oneOf: [{
				type: "object"
			}, {
				type: "null"
			}]
		},
		vars: {
			title: 'Variables',
			description: "Parameters that can be changed by UI",
			oneOf: [{
				type: "object"
			}, {
				type: "null"
			}]
		},
		type: {
			title: 'Render to type',
			description: 'Use this element type to render data',
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

