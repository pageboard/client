exports.input_button = {
	title: 'Button',
	icon: '<i class="hand pointer icon"></i>',
	menu: "form",
	group: "block input_field",
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
	html: '<button type="[type]" disabled="[disabled]" class="ui [full|alt:fluid:] button" name="[name]" value="[value]">[type|schema:title]</button>',
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
		},
		grouped: {
			title: "Grouped",
			type: 'boolean',
			default: false
		},
		full: {
			title: 'Full width',
			type: 'boolean',
			default: false
		}
	},
	contents: "(input_label|input_field)*",
	html: `<div class="[inline] [grouped] [full|alt:fluid:] fields"></div>`
};

exports.input_label = {
	title: 'Input Label',
	icon: '<i class="icons"><i class="text cursor icon"></i><i class="corner tag icon"></i></i>',
	menu: "form",
	group: "block",
	context: "input_fields//",
	contents: "inline*",
	html: `<label></label>`
};

exports.input_text = {
	title: 'Input',
	icon: '<i class="text cursor icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block input_field",
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
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
		tel: /^(\(\d+\))? *\d+([ .-]?\d+)*$/.source,
		email: /^[\w.!#$%&'*+/=?^`{|}~-]+@\w(?:[\w-]{0,61}\w)?(?:\.\w(?:[\w-]{0,61}\w)?)*$/.source
	},
	html: `<div class="[width|as:colnums|post: wide] field [type|eq:hidden]">
		<label block-content="label">Label</label>
		[type|eq:textarea|prune:*:1]<textarea
			is="element-textarea"
			name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
			placeholder="[placeholder]"
		>[value|as:text]</textarea>
		[type|neq:textarea|prune:*:1]<input name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
			placeholder="[placeholder]"
			type="[type|switch:new-password:password]"
			pattern="[$element.patterns.[type]]"
			value="[value]"
			autocomplete="[type|eq:new-password|fail:]" />
	</div>`,
	scripts: ['../ui/textarea.js'],
	stylesheets: ['../ui/textarea.css']
};

exports.input_number = {
	title: 'Number',
	icon: '<i class="text cursor icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block input_field",
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
	html: `<div class="field">
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
	group: "block input_field",
	context: 'form//',
	properties: Object.assign({}, exports.input_number.properties, {
		multiple: {
			title: 'Multiple',
			type: 'boolean',
			default: false
		},
		pips: {
			title: 'Pips',
			type: 'boolean',
			default: false
		},
		step: {
			title: 'Step',
			type: "number",
			default: 10
		}
	}),
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
	group: "block input_field",
	context: 'form//',
	required: ["name"],
	properties: {
		name: {
			title: "Name",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
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
		<div class="ui [toggle] checkbox">
			<input type="checkbox" required="[required]" disabled="[disabled]"
				name="[name]" value="[value]" checked="[checked]"
				id="for-[name][value|pre:-]" />
			<label block-content="label" for="for-[name][value|pre:-]">Label</label>
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
	group: "block input_field",
	context: 'form//',
	required: ["name"],
	properties: {
		name: {
			title: "name",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
		},
		value: {
			title: "Value",
			type: "string",
			format: "singleline"
		},
		checked: {
			title: "Checked",
			type: "boolean",
			default: false
		},
		required: {
			title: 'Required',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: "Disabled",
			type: "boolean",
			default: false
		},
		button: {
			title: 'Button',
			description:'hide radio toggle opacity',
			type: "boolean",
			default: false
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field [button]">
		<div class="ui radio [button|alt::checkbox]">
			<input type="radio" disabled="[disabled]" required="[required]"
				name="[name]" value="[value]" checked="[checked]"
				id="for-[name][value|pre:-]" />
			<label block-content="label" for="for-[name][value|pre:-]">Label</label>
		</div>
	</div>`,
	stylesheets: [
		'../lib/components/checkbox.css',
		'../ui/input_radio.css'
	]
};

exports.input_select = {
	title: 'Select',
	icon: '<i class="caret down icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block input_field",
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
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
		<element-select class="ui selection dropdown [multiple]"
			data-name="[name]" data-disabled="[disabled]" data-required="[required]"
			data-multiple="[multiple]" data-placeholder="[placeholder]"
			data-value="[value]"
		>
			<div class="menu" block-content="options"></div>
		</element-select>
	</div>`,
	stylesheets: [
		'../lib/components/dropdown.css',
		'../lib/components/label.css',
		'../ui/select.css'
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
	html: `<element-select-option class="item" data-value="[value]"
	></element-select-option>`
};


