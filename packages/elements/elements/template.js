Pageboard.elements.template = {
	priority: 1,
	title: 'Template',
	icon: '<b class="icon">[*]</b>',
	menu: 'form',
	group: 'block template',
	template: true,
	contents: {
		template: {
			title: 'Template',
			spec: 'block+'
		}
	},
	html: `<element-template>
		<div block-content="template"></div>
		<div class="view"></div>
	</element-template>`,
	stylesheets: [
		'../ui/template.css'
	],
	scripts: [
		'../ui/template.js'
	]
};

Pageboard.elements.fetch = Object.assign({}, Pageboard.elements.template, {
	title: "Fetch",
	icon: '<i class="search icon"></i>',
	fuse: function(node, d, scope) {
		// do not call /.api/query if not true
		node.setAttribute('remote', !!(d.method));
		var keys = [];
		(function findKeys(val) {
			if (!val) return;
			if (typeof val == "string") {
				if (val.startsWith('$query.')) keys.push(val.substring(7));
			} else if (Array.isArray(val)) {
				val.forEach(findKeys);
			} else if (typeof val == "object") {
				Object.values(val).forEach(findKeys);
			}
		})(d.parameters);
		if (keys.length) node.setAttribute('keys', keys.join(','));
	},
	properties: {
		method: {
			title: 'Method',
			nullable: true,
			type: "string",
			pattern: "^(\\w+\\.\\w+)?$"
		},
		parameters: {
			title: 'Parameters',
			nullable: true,
			type: "object"
		}
	},
	$filter: {
		name: 'service',
		action: "read"
	},
	$helper: 'service'
});

Pageboard.elements.binding = {
	title: "Binding",
	icon: '<b class="icon">[*]</b>',
	properties: {
		fill: {
			title: 'Fill',
			description: 'fill content with matchdom expression, filters on new lines',
			type: 'string'
		},
		attr: {
			title: 'Attribute',
			description: 'set attributes with matchdom expression, filters on new lines',
			type: 'string',
		},
		placeholder: {
			title: 'Placeholder',
			type: 'string',
			format: 'singleline'
		}
	},
	context: 'template//',
	inline: true,
	group: "inline nolink",
	html: '<span data-attr="[attr]" data-fill="[fill]">[ph]</span>',
	fuse: function(node, d, scope) {
		var fill = (d.fill || '').trim().split('\n').join('|');
		node.fuse({
			ph: d.placeholder || fill.split('|', 1)[0].split('.').pop() || '',
			attr: d.attr ? `[${d.attr.trim().split('\n').join('|')}]`: null,
			fill: fill ? `[${fill}|fill]` : null
		}, scope);
	}
};

Pageboard.elements.content = {
	title: "Content",
	icon: '<b class="icon">cont</b>',
	menu: "form",
	group: 'block',
	context: 'template//',
	properties: {
		name: {
			title: 'Name',
			description: 'Must match element content name',
			type: 'string',
			format: "id",
			$helper: {
				name: 'element-content',
				standalone: true
			}
		}
	},
	html: '<div block-content="[name]"></div>'
};
