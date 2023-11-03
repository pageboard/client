exports.fieldset = {
	title: 'Fieldset',
	icon: '<i class="folder outline icon"></i>',
	menu: 'form',
	group: 'block',
	context: 'form//',
	properties: {
		plain: {
			title: 'Plain',
			description: 'Without legend or borders',
			type: 'boolean',
			default: false
		},
		name: {
			title: 'When input named',
			type: 'string',
			format: 'singleline',
			nullable: true,
			$helper: 'form-element'
		},
		op: {
			title: 'Condition',
			anyOf: [{
				const: 'eq',
				title: 'is equal to'
			}, {
				const: 'neq',
				title: 'is not equal to'
			}],
			default: 'eq'
		},
		value: {
			title: 'Value',
			type: 'string',
			format: 'singleline'
		}
	},
	contents: "fieldset_legend block+",
	html: '<fieldset class="[plain]" data-name="[name]" data-op="[op]" data-value="[value]" is="element-fieldset"></fieldset>',
	scripts: ["../ui/fieldset.js"],
	stylesheets: ['../ui/fieldset.css']
};

exports.fieldset_legend = {
	context: 'fieldset//',
	contents: "inline*",
	html: '<legend>Title</legend>'
};

exports.fieldset_list = {
	title: 'Field List',
	priority: 2, // after template
	menu: "form",
	icon: '<i class="icons"><i class="folder outline icon"></i><i class="corner add icon"></i></i>',
	group: 'block template',
	context: 'form//',
	properties: {
		min: {
			title: 'Min items',
			type: "integer",
			minimum: 0,
			default: 1
		},
		max: {
			title: 'Max items',
			type: "integer",
			minimum: 1,
			default: 100
		},
		at: {
			title: 'Repeat selector',
			description: 'css selector',
			type: "string",
			format: 'singleline'
		}
	},
	contents: [{
		id: 'template',
		nodes: 'block+',
		expressions: true
	}],
	html: `<element-fieldset-list data-max="[max]" data-min="[min]" data-at="[at]">
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
	group: 'block input_field',
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
		},
		icon: {
			title: 'Icon',
			type: 'boolean',
			default: false
		},
		compact: {
			title: 'Compact',
			type: 'boolean',
			default: false
		},
		float: {
			title: 'Float',
			anyOf: [{
				type: 'null',
				title: 'No'
			}, {
				const: 'left',
				title: 'Left'
			}, {
				const: 'right',
				title: 'Right'
			}],
			default: null
		}
	},
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<button type="button" class="ui [full|alt:fluid:] [icon] [compact] [float|post:%20floated] button" value="[type]">Label</button>',
	stylesheets: [
		'../lib/components/button.css',
	]
};
