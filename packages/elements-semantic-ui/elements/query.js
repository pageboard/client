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
	properties: {
		consts: {
			title: 'Constants',
			type: "object"
		},
		vars: {
			title: 'Variables',
			description: "Parameters that can be changed by UI",
			type: "object"
		},
		type: {
			title: 'Render type',
			description: 'Force rendering of blocks to this type',
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
		'../ui/query.js'
	]
};

