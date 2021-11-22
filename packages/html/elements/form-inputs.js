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
			nullable: true,
			$helper: {
				name: 'element-property',
				existing: true
			}
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

exports.input_button = {
	title: 'Button',
	icon: '<i class="hand pointer icon"></i>',
	menu: "form",
	group: "block",
	context: 'form//',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	properties: {
		type: {
			title: 'Type',
			default: 'submit',
			anyOf: [{
				title: 'Submit',
				const: 'submit'
			}, {
				title: 'Reset',
				const: 'reset'
			}, {
				title: 'Cancel',
				const: 'cancel'
			}, {
				title: 'Button',
				const: 'button'
			}]
		},
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "Default value",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		disabled: {
			title: 'Disabled',
			type: 'boolean',
			default: false
		},
		full: {
			title: 'Full width',
			type: 'boolean',
			default: false
		}
	},
	html: '<button type="[type]" disabled="[disabled]" class="ui [full|?:fluid:] button" name="[name]" value="[value]">[type|schema:title]</button>',
	stylesheets: [
		'../lib/components/button.css',
	]
};

exports.input_fields = {
	title: 'Input Fields',
	icon: '<i class="icon columns"></i>',
	menu: "form",
	group: "block",
	context: "form//",
	properties: {
		inline: {
			title: "Inline",
			type: 'boolean',
			default: false
		}
	},
	contents: "(input_text|input_range|input_checkbox|input_radio|input_select|input_button)+",
	html: `<div class="[inline|?] fields"></div>`
};

exports.input_text = {
	title: 'Input',
	icon: '<i class="text cursor icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "Default value",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		placeholder: {
			title: "Placeholder",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		required: {
			title: 'Required',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: 'Disabled',
			type: 'boolean',
			default: false
		},
		readonly: {
			title: 'Read only',
			type: 'boolean',
			default: false
		},
		type: {
			title: 'Format',
			default: "text",
			anyOf: [{
				const: "text",
				title: "Text"
			}, {
				const: "textarea",
				title: "Textarea"
			}, {
				const: "email",
				title: "Email"
			}, {
				const: "tel",
				title: "Tel"
			}, {
				// deprecated, use input_number or input_range
				const: "number"
			}, {
				const: "hidden",
				title: "Hidden"
			}, {
				const: "password",
				title: "Password"
			}, {
				const: "new-password",
				title: "New password"
			}]
		},
		width: {
			title: 'Width',
			description: 'Between 1 and 16, set to 0 for auto',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	patterns: {
		tel: '^(\\(\\d+\\))? *\\d+([ .\\-]?\\d+)*$',
		email: '^[\\w.!#$%&\'*+\\/=?^`{|}~-]+@\\w(?:[\\w-]{0,61}\\w)?(?:\\.\\w(?:[\\w-]{0,61}\\w)?)*$'
	},
	html: `<div class="[width|num: wide] field [type|eq:hidden:hidden:]">
		<label block-content="label">Label</label>
		<textarea
			name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
			placeholder="[placeholder]"
		>[value|br]</textarea>[type|eq:textarea|bmagnet:+*]
		<input name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
			placeholder="[placeholder]"
			type="[type|eq:new-password:password]"
			pattern="[$element.patterns.[type]|ornull]"
			value="[value]"
			autocomplete="[type|neq:new-password:|not]" />[type|neq:textarea|bmagnet:+*]
	</div>`
};

exports.input_number = {
	title: 'Number',
	icon: '<i class="text cursor icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: exports.input_text.properties.name,
		disabled: exports.input_text.properties.disabled,
		required: exports.input_text.properties.required,
		value: exports.input_text.properties.value,
		min: {
			title: 'Minimum value',
			type: "number",
			nullable: true
		},
		max: {
			title: 'Maximum value',
			type: "number",
			nullable: true
		},
		step: {
			title: 'Step',
			type: "number",
			default: 0.001
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="[width|num: wide] field">
		<label block-content="label">Label</label>
		<input name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
			placeholder="[placeholder]"
			type="number"
			value="[value]"
			min="[minimum]"
			max="[maximum]"
			step="[step]"
	</div>`
};

exports.input_range = {
	title: 'Range',
	icon: '<i class="options icon"></i>',
	menu: "form",
	group: "block",
	context: 'form//',
	properties: Object.assign({
		multiple: {
			title: 'Multiple',
			type: 'boolean',
			default: false
		},
		pips: {
			title: 'Pips',
			type: 'boolean',
			default: true
		}
	}, exports.input_number.properties),
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<input required="[required]" disabled="[disabled]" is="element-input-range"
			value="[value]"
			name="[name]"
			min="[min]"
			max="[max]"
			step="[step]" pips="[pips]"
			multiple="[multiple]" />
	</div>`,
	stylesheets: [
		'../lib/nouislider.css',
		'../ui/input-range.css'
	],
	scripts: [
		'../lib/nouislider.js',
		'../ui/input-range.js'
	]
};

exports.input_checkbox = {
	title: 'Checkbox',
	icon: '<i class="checkmark box icon"></i>',
	menu: "form",
	group: "block",
	context: 'form//',
	required: ["name"],
	properties: {
		name: {
			title: "Name",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "Value",
			type: "string",
			format: "singleline"
		},
		checked: {
			title: 'Checked',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: 'Disabled',
			type: 'boolean',
			default: false
		},
		required: {
			title: 'Required',
			type: 'boolean',
			default: false
		},
		toggle: {
			title: 'Toggle',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<div class="ui [toggle|?] checkbox">
			<input type="checkbox" required="[required]" disabled="[disabled]"
				name="[name]" value="[value]" checked="[checked]"
				id="for-[name][value|or:|pre:-]-[$id|slice:0:6]" />
			<label block-content="label" for="for-[name][value|or:|pre:-]-[$id|slice:0:6]">Label</label>
		</div>
	</div>`,
	stylesheets: [
		'../lib/components/checkbox.css'
	]
};

exports.input_radio = {
	title: 'Radio',
	icon: '<i class="selected radio icon"></i>',
	menu: "form",
	group: "block",
	context: 'form//',
	required: ["name"],
	properties: {
		name: {
			title: "name",
			type: "string",
			format: "singleline"
		},
		checked: {
			title: "Checked",
			type: "boolean",
			default: false
		},
		value: {
			title: "Value",
			type: "string",
			format: "singleline"
		},
		disabled: {
			title: "Disabled",
			type: "boolean",
			default: false
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<div class="ui radio checkbox">
			<input type="radio" disabled="[disabled]"
				name="[name]" value="[value|or:]" checked="[checked]"
				id="for-[name][value|or:|pre:-]-[$id|slice:0:6]" />
			<label block-content="label" for="for-[name][value|or:|pre:-]-[$id|slice:0:6]">Label</label>
		</div>
	</div>`,
	stylesheets: [
		'../lib/components/checkbox.css'
	]
};

exports.input_select = {
	title: 'Select',
	icon: '<i class="caret down icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		placeholder: {
			title: "Placeholder",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		disabled: {
			title: 'Disabled',
			type: 'boolean',
			default: false
		},
		required: {
			title: 'Required',
			type: 'boolean',
			default: false
		},
		multiple: {
			title: 'Multiple',
			type: 'boolean',
			default: false
		},
		value: {
			title: "Default value",
			nullable: true,
			type: "string",
			format: "singleline"
		}
	},
	contents: [{
		id: 'label',
		nodes: 'inline*',
		title: 'Label'
	}, {
		id: 'options',
		title: 'Options',
		nodes: 'input_select_option+'
	}],
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-select class="ui selection dropdown [multiple|?]"
			data-name="[name]" data-disabled="[disabled]" data-required="[required]"
			data-multiple="[multiple]" data-placeholder="[placeholder]"
			data-value="[value]"
		>
			<div class="menu" block-content="options"></div>
		</element-select>
	</div>`,
	stylesheets: [
		'../lib/components/dropdown.css',
		'../lib/components/label.css'
	],
	scripts: [
		'../ui/select.js'
	]
};

exports.input_select_option = {
	title: 'Option',
	menu: "form",
	icon: '<b class="icon">Opt</b>',
	properties: {
		value: {
			title: "Value",
			description: "Defaults to option label",
			nullable: true,
			type: "string",
			format: "singleline"
		}
	},
	contents: 'inline*',
	html: `<element-select-option class="item" data-value="[value|or:]"
	></element-select-option>`
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
