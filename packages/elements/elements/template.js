Pageboard.elements.template = {
	priority: 1,
	title: 'Template',
	// icon: '<b class="icon">[*]</b>',
	menu: 'form',
	group: 'block template',
	contents: {
		template: {
			title: 'Template',
			spec: 'block+',
			expressions: true
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
	expressions: true,
	html: `<element-template remote="[action.method|!!]">
		<div block-content="template"></div>
		<div class="view"></div>
	</element-template>`,
	properties: {
		action: {
			title: 'Action',
			type: 'object',
			required: ["method"],
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
		}
	}
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
		}
	},
	context: 'template//',
	inline: true,
	group: "inline nolink",
	html: `<span
		data-attr="[attr|trim|split:%0A|join:%7C|pre:%5B|post:%5D]"
		data-label="[fill|split:%0A|slice:0:1|join:|split:.|slice:-1|join:|or: ]"
	>[fill|trim|split:%0A|join:%7C|pre:%5B|post:%5D]</span>`
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
