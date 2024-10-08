exports.fieldset = {
	title: 'Fieldset',
	icon: '<i class="folder outline icon"></i>',
	menu: 'form',
	group: 'block',
	context: 'form//',
	properties: {
		name: {
			title: 'Show if input named',
			type: 'string',
			format: 'singleline',
			nullable: true
		},
		value: {
			title: 'matches this value',
			type: 'string',
			format: 'singleline'
		},
		plain: {
			title: 'Without borders',
			type: 'boolean',
			default: false
		}
	},
	contents: "fieldset_legend block+",
	html: '<fieldset class="[plain|?]" data-name="[name]" data-value="[value]" is="element-fieldset"></fieldset>',
	scripts: ["../ui/fieldset.js"]
};

exports.fieldset_legend = {
	inplace: true,
	contents: "inline*",
	html: '<legend>Title</legend>'
};

exports.fieldset_list = {
	title: 'FieldList',
	menu: "form",
	icon: '<i class="icons"><i class="folder outline icon"></i><i class="corner add icon"></i></i>',
	group: "block",
	context: 'form//',
	priority: 0,
	properties: {
		size: {
			title: 'Minimum size',
			type: "integer",
			minimum: 0,
			default: 1
		},
		prefix: {
			title: 'Prefix',
			description: '',
			type: "string",
			format: 'singleline',
			nullable: true
		}
	},
	contents: [{
		id: 'template',
		nodes: 'block+'
	}],
	html: `<element-fieldset-list data-size="[size]" data-prefix="[prefix]">
		<template block-content="template"></template>
		<div class="view"></div>
	</element-fieldset-list>`,
	scripts: ['../ui/fieldset-list.js'],
	stylesheets: ['../ui/fieldset-list.css']
};
