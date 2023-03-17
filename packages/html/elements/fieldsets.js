exports.fieldset = {
	title: 'Fieldset',
	icon: '<i class="folder outline icon"></i>',
	menu: 'form',
	group: 'block',
	context: 'form//',
	properties: {
		name: {
			title: 'Show if input[name]',
			type: 'string',
			format: 'singleline',
			nullable: true,
			$helper: 'form-element'
		},
		value: {
			title: 'matches this value',
			type: 'string',
			format: 'singleline',
			$filter: {
				name: 'element-value',
				using: 'name'
			}
		},
		plain: {
			title: 'Plain',
			description: 'Without legend or borders',
			type: 'boolean',
			default: false
		}
	},
	contents: "fieldset_legend block+",
	html: '<fieldset class="[plain]" data-name="[name]" data-value="[value]" is="element-fieldset"></fieldset>',
	scripts: ["../ui/fieldset.js"],
	stylesheets: ['../ui/fieldset.css']
};

exports.fieldset_legend = {
	inplace: true,
	context: 'fieldset//',
	contents: "inline*",
	html: '<legend>Title</legend>'
};

exports.fieldset_list = {
	title: 'Field List',
	menu: "form",
	icon: '<i class="icons"><i class="folder outline icon"></i><i class="corner add icon"></i></i>',
	group: 'block template',
	context: 'form//',
	priority: 0,
	properties: {
		size: {
			title: 'Minimum size',
			type: "integer",
			minimum: 0,
			default: 1
		}
	},
	contents: [{
		id: 'template',
		nodes: 'block+',
		expressions: true
	}],
	html: `<element-fieldset-list data-size="[size]">
		<template block-content="template"></template>
		<div class="view"></div>
	</element-fieldset-list>`,
	scripts: ['../ui/fieldset-list.js'],
	stylesheets: ['../ui/fieldset-list.css']
};


exports.fieldlist_button = {
	title: 'Field List Button',
	menu: "form",
	icon: '<i class="icons"><i class="folder outline icon"></i><i class="corner hand pointer icon"></i></i>',
	group: 'block',
	context: 'fieldset_list//',
	properties: {
		type: {
			title: 'Type',
			default: 'add',
			anyOf: [{
				title: 'Add',
				const: 'add'
			}, {
				title: 'Delete',
				const: 'del'
			}, {
				title: 'Up',
				const: 'up'
			}, {
				title: 'Down',
				const: 'down'
			}]
		},
		full: {
			title: 'Full width',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<button type="button" class="ui [full|alt:fluid:] button" value="[type]">Label</button>',
	stylesheets: [
		'../lib/components/button.css',
	]
};
