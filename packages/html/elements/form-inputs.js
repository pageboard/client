exports.fieldset = {
	title: 'Fieldset',
	icon: '<i class="folder outline icon"></i>',
	menu: 'form',
	group: 'block',
	context: 'form//',
	properties: {
		plain: {
			title: 'Without borders',
			type: 'boolean',
			default: false
		}
	},
	contents: "fieldset_legend block+",
	html: '<fieldset class="[plain|?]"></fieldset>'
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
			title: 'type',
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
			}]
		},
		name: {
			title: "name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "default value",
			nullable: true,
			type: "string",
			format: "singleline"
		}
	},
	html: '<button type="[type]" class="ui button" name="[name]" value="[value]">[type|schema:title]</button>',
	stylesheets: [
		'../lib/components/button.css',
	]
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
			title: "name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "default value",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		placeholder: {
			title: "placeholder",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		required: {
			title: 'required',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
			default: false
		},
		type: {
			title: 'format',
			default: "text",
			anyOf: [{
				const: "text",
				title: "text"
			}, {
				const: "textarea",
				title: "textarea"
			}, {
				const: "email",
				title: "email"
			}, {
				const: "tel",
				title: "tel"
			}, {
				const: "number",
				title: "number"
			}, {
				const: "hidden",
				title: "hidden"
			}, {
				const: "password",
				title: "password"
			}, {
				const: "new-password",
				title: "new password"
			}]
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
	html: `<div class="field [type|eq:hidden:hidden:]">
		<label block-content="label">Label</label>
		<textarea
			name="[name]"
			required="[required|not]"
			disabled="[disabled|not]"
			placeholder="[placeholder]"
		>[value|br]</textarea>[type|eq:textarea|bmagnet:+*]
		<input name="[name]"
			required="[required]"
			disabled="[disabled]"
			placeholder="[placeholder]"
			type="[type|eq:new-password:password]"
			pattern="[$element.patterns.[type]|ornull]"
			value="[value]"
			autocomplete="[type|neq:new-password:|not]" />[type|neq:textarea|bmagnet:+*]
	</div>`
};

exports.input_range = {
	title: 'Range',
	icon: '<i class="options icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
			default: false
		},
		required: {
			title: 'required',
			type: 'boolean',
			default: false
		},
		multiple: {
			title: 'multiple',
			type: 'boolean',
			default: false
		},
		value: {
			title: "value",
			type: "number",
			default: 50
		},
		min: {
			title: 'minimum value',
			type: "number",
			default: 0
		},
		max: {
			title: 'maximum value',
			type: "number",
			default: 100
		},
		step: {
			title: 'step',
			type: "number",
			default: 1
		}
	},
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
			step="[step]"
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
			title: "name",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "value",
			type: "string",
			format: "singleline"
		},
		checked: {
			title: 'checked',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
			default: false
		},
		required: {
			title: 'required',
			type: 'boolean',
			default: false
		},
		toggle: {
			title: 'toggle',
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
				id="for-[name][value|or:|pre:-]-[$id|slice:0:4]" />
			<label block-content="label" for="for-[name][value|or:|pre:-]-[$id|slice:0:4]">Label</label>
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
			title: 'checked',
			type: 'boolean',
			default: false
		},
		value: {
			title: "value",
			type: "string",
			format: "singleline"
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
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
				id="for-[name][value|or:|pre:-]-[$id|slice:0:4]" />
			<label block-content="label" for="for-[name][value|or:|pre:-]-[$id|slice:0:4]">Label</label>
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
			title: "name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		placeholder: {
			title: "placeholder",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
			default: false
		},
		required: {
			title: 'required',
			type: 'boolean',
			default: false
		},
		multiple: {
			title: 'multiple',
			type: 'boolean',
			default: false
		},
		value: {
			title: "default value",
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
			value="[value]"
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
			title: "value",
			description: "Defaults to option label",
			nullable: true,
			type: "string",
			format: "singleline"
		}
	},
	contents: 'inline*',
	html: `<element-select-option class="item" data-value="[value|or:]"
	></element-select-option>`,
	resources: {
		helper: '../ui/select-helper.js'
	},
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	}
};

exports.input_array = {
	title: 'Array',
	menu: "form",
	icon: '<b class="icon">...</b>',
	group: "block",
	context: 'form//',
	contents: [{
		id: 'legend',
		nodes: 'inline*',
		title: 'Legend'
	}, {
		id: 'inputs',
		title: 'Inputs',
		nodes: '(input_text|input_file)+'
	}],
	html: `<fieldset>
		<legend block-content="legend">Legend</legend>
		<element-input-array block-content="inputs"></element-input-array>
	</fieldset>`,
	scripts: ['../ui/input-array.js'],
	stylesheets: ['../ui/input-array.css']
};
