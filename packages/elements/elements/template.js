exports.template = {
	priority: 1,
	title: 'Template',
	// icon: '<b class="icon">[*]</b>',
	menu: 'form',
	group: 'block template',
	contents: {
		id: 'template',
		nodes: 'block+',
		expressions: true
	},
	html: `<element-template>
		<template block-content="template"></template>
		<div class="view"></div>
	</element-template>`,
	fuse: function(node, d, scope) {
		var dom = node.fuse(d, scope);
		if (scope.$write) {
			dom.firstElementChild.replaceWith(node.dom('<div block-content="template"></div>'));
		}
		return dom;
	},
	stylesheets: [
		'../ui/template.css'
	],
	scripts: [
		'../ui/template.js'
	]
};

exports.fetch = Object.assign({}, exports.template, {
	title: "Fetch",
	icon: '<i class="search icon"></i>',
	expressions: true,
	html: `<element-template data-remote="[action.method|!!]">
		<template block-content="template"></template>
		<div class="view"></div>
	</element-template>`,
	properties: {
		action: {
			title: 'Action',
			type: 'object',
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

exports.binding = {
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
			type: 'string'
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

exports.content = {
	title: "Content",
	icon: '<i class="square outline icon"></i>',
	menu: "form",
	group: 'block',
	context: 'template//',
	properties: {
		name: {
			title: 'Name',
			description: 'Must match element content name',
			type: 'string',
			format: "id",
			// $helper: {
			// 	name: 'element-content',
			// 	standalone: true
			// }
		},
		fill: {
			title: 'Fill',
			description: 'Fill with template expression',
			type: 'string'
		}
	},
	html: '<div block-content="[name]">[fill|trim|split:%0A|join:%7C|pre:%5B|post:%5D]</div>'
};
