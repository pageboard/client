Pageboard.elements.fieldset = {
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
	contents: {
		content: "fieldset_legend block+"
	},
	html: '<fieldset block-content="content" class="[plain|?]"></fieldset>'
};

Pageboard.elements.fieldset_legend = {
	inplace: true,
	contents: {
		legend: "inline*"
	},
	html: '<legend block-content="legend">Title</legend>'
};

Pageboard.elements.input_button = {
	title: 'Button',
	icon: '<i class="hand pointer icon"></i>',
	menu: "form",
	group: "block",
	context: 'form//',
	contents: {
		label: {
			spec: "inline*",
			marks: "nolink"
		}
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
	html: '<button type="[type]" class="ui button" block-content="label" name="[name]" value="[value]">[type|schema:title]</button>',
	stylesheets: [
		'../lib/components/button.css',
	]
};

Pageboard.elements.input_text = {
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
			}]
		}
	},
	contents: {
		label: 'inline*'
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
			type="[type]"
			value="[value]" />[type|neq:textarea|bmagnet:+*]
	</div>`
};

Pageboard.elements.input_file = {
	title: 'Upload',
	icon: '<i class="upload icon"></i>',
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
		now: {
			title: 'upload on change',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		label: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-file class="ui action input" data-now="[now]">
			<input type="text" name="[name]" />
			<input type="file" required="[required]"
				disabled="[disabled]"
				placeholder="[placeholder]" />
			<div class="ui icon button">
				<i class="upload icon"></i>
				<i class="delete icon"></i>
			</div>
			<div class="mini floating ui basic label"></div>
		</element-input-file>
	</div>`,
	stylesheets: [
		'../lib/components/input.css',
		'../lib/components/label.css',
		'../ui/input-file.css'
	],
	scripts: [
		'../ui/input-file.js'
	]
};

Pageboard.elements.input_range = {
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
		value: {
			title: "default value",
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
		label: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-range>
			<input type="range" required="[required]" disabled="[disabled]"
				value="[value]"
				data-default="[value]"
				name="[name]"
				min="[min]"
				max="[max]"
				step="[step]" />
		</element-input-range>
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

Pageboard.elements.input_checkbox = {
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
		label: 'inline*'
	},
	html: `<div class="field">
		<div class="ui [toggle|?] checkbox">
			<input type="checkbox" required="[required]" disabled="[disabled]"
				name="[name]"
				value="[value]"
				id="[$id|slice:0:4|pre:for]" />
			<label block-content="label" for="[$id|slice:0:4|pre:for]">Label</label>
		</div>
	</div>`,
	stylesheets: [
		'../lib/components/checkbox.css'
	]
};

Pageboard.elements.input_radio = {
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
		label: 'inline*'
	},
	html: `<div class="field">
		<div class="ui radio checkbox">
			<input type="radio" disabled="[disabled]"
				name="[name]"
				value="[value|or:]"
				id="[$id|slice:0:4|pre:for]" />
			<label block-content="label" for="[$id|slice:0:4|pre:for]">Label</label>
		</div>
	</div>`,
	stylesheets: [
		'../lib/components/checkbox.css'
	]
};

Pageboard.elements.input_select = {
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
	contents: {
		label: {
			title: 'Label',
			spec: 'inline*'
		},
		options: {
			title: 'Options',
			spec: 'input_select_option+'
		}
	},
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

Pageboard.elements.input_select_option = {
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
	contents: {
		label: {
			title: 'Label',
			spec: 'inline*'
		}
	},
	html: `<element-select-option class="item"
		block-content="label" data-value="[value]"
	></element-select-option>`,
	resources: [
		'../ui/select-helper.js'
	],
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources[0], scope);
	}
};
