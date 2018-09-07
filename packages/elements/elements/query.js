Pageboard.elements.query = {
	priority: 1, // scripts must run after 'form' scripts
	title: "Fetch",
	icon: '<i class="search icon"></i>',
	menu: "form",
	group: "block",
	contents: {
		template: {
			title: 'Template',
			spec: 'block+'
		},
		view: {
			title: 'View',
			spec: 'block+',
			virtual: true
		}
	},
	html: `<element-query>
		<div block-content="template"></div>
		<div block-content="view"></div>
	</element-query>`,
	fuse: function(node, d) {
		// do not call /.api/query if not true
		node.dataset.remote = !!(d.method);
		// needed to track query changes
		var keys = [];
		Object.keys(d.parameters || {}).forEach(function(key) {
			var val = d.parameters[key];
			if (val != null) val = val.toString();
			if (val.startsWith('$query.')) keys.push(val.substring(7));
		});
		if (keys.length) node.dataset.keys = JSON.stringify(keys);
	},
	properties: {
		method: {
			title: 'Method',
			type: "string",
			pattern: "^(\\w+\.\\w+)?$"
		},
		parameters: {
			title: 'Parameters',
			anyOf: [{
				type: "object"
			}, {
				type: "null"
			}]
		}
	},
	$filter: {
		name: 'service',
		action: "read"
	},
	$helper: {
		name: 'service'
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
	icon: '<i class="announcement icon"></i>',
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
	html: '<div class="[type]" block-content="message">Message</div>'
};


Pageboard.elements.query_template = {
	title: "Template",
	icon: '<b class="icon">var</b>',
	properties: {
		fill: {
			title: 'Fill',
			description: 'fill content with matchdom expression, filters on new lines',
			type: 'string',
			$helper: {
				multiline: true
			}
		},
		attr: {
			title: 'Attribute',
			description: 'set attributes with matchdom expression, filters on new lines',
			type: 'string',
			$helper: {
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

Pageboard.elements.query_content = {
	title: "Content",
	icon: '<b class="icon">cont</b>',
	menu: "form",
	group: 'block',
	context: 'query//',
	properties: {
		name: {
			title: 'Name',
			description: 'Must match element content name',
			type: 'string',
			$helper: {
				name: 'element-content',
				standalone: true
			}
		}
	},
	html: '<div block-content="[name]"></div>'
};
