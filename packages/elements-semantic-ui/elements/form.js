// Nota Bene
// query forms initialize their inputs from document.location's query
Pageboard.elements.form = {
	title: 'Form',
	group: 'block',
	menu: "form",
	properties: {
		required: ["action"],
		action: {
			title: 'Action',
			type: 'object',
			required: ["call"],
			properties: {
				method: {
					title: 'Method',
					oneOf: [{
						const: "get",
						title: "query url"
					}, {
						const: "post",
						title: "submit data"
					}],
					default: "get"
				},
				trigger: {
					title: 'Submit with',
					oneOf: [{
						const: "",
						title: "button"
					}, {
						const: "input",
						title: "live input"
					} /*, {
						const: "valid",
						title: "valid form"
					} */],
					default: ""
				},
				call: {
					title: 'Call api or url',
					type: "string",
					pattern: "^(\\w+\.\\w+)|((/[\\w-.]*)+)$"
				},
				consts: {
					title: 'Constants',
					description: 'Server input',
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "Client input",
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				}
			}
		},
		redirection: {
			title: 'Redirection',
			description: 'Optional after successful submission',
			type: 'object',
			properties: {
				url: {
					title: 'Address',
					oneOf: [{
						type: "null"
					}, {
						type: "string",
						pattern: "^(/[a-zA-Z0-9-.]*)+$"
					}],
					input: {
						name: 'href',
						filter: {
							type: ["link"]
						}
					}
				},
				consts: {
					title: 'Constants',
					description: 'Server input',
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "Client input",
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				}
			}
		}
	},
	contents: {
		form: {
			spec: '(block|input)+ input_submit'
		}
	},
	icon: '<i class="write icon"></i>',
	render: function(doc, block) {
		var action = block.data.action;
		var input, url;
		if (action.method == "get") {
			url = action.call;
			input = '';
		} else if (action.method == "post") {
			url = "/.api/form";
			input = doc.dom`<input type="hidden" name="parent" value="${block.id}" />`;
		}

		var form = doc.dom`<form action="${url}" method="${action.method}" class="ui form">
			${input}
			<div block-content="form"></div>
		</form>`;
		if (action.trigger) form.dataset.trigger = action.trigger;
		return form;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../ui/lib/formdata.min.js',
		'../ui/form.js'
	]
};

Pageboard.elements.input_submit = {
	menu: "form",
	contents: {
		label: "text*"
	},
	render: function(doc, block) {
		return doc.dom`<button type="submit" class="ui button" block-content="label">Submit</button>`;
	}
};

Pageboard.elements.input_text = {
	title: 'Input',
	menu: "form",
	required: ["name"],
	group: 'input',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string"
		},
		value: {
			title: "default value",
			type: ["string", "null"]
		},
		placeholder: {
			title: "placeholder",
			type: ["string", "null"]
		},
		required: {
			title: 'required',
			type: 'boolean',
			default: false
		},
		type: {
			title: 'format',
			oneOf: [{
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
				const: "date",
				title: "date"
			}, {
				const: "time",
				title: "time"
			}, {
				const: "number",
				title: "number"
			}, {
				const: "file",
				title: "file"
			}, {
				const: "hidden",
				title: "hidden"
			}]
		}
	},
	contents: {
		label: 'inline*'
	},
	icon: '<i class="text cursor icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var input;
		if (d.type == "textarea") {
			input = doc.dom`<textarea name="${d.name}"></textarea>`;
			if (d.value) input.innerText = d.value;
		} else {
			input = doc.dom`<input type="${d.type}" name="${d.name}" />`;
			if (d.value) input.value = d.value;
		}
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		var node = doc.dom`<div class="field">
			<label block-content="label">Label</label>
			${input}
		</div>`;
		if (d.type == "hidden") node.classList.add('hidden');
		return node;
	}
};

Pageboard.elements.input_range = {
	title: 'Range',
	menu: "form",
	required: ["name"],
	group: 'input',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string"
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
	icon: '<i class="options icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var input = doc.dom`<input type="range" name="${d.name}" min="${d.min}" max="${d.max}" step="${d.step}" />`;
		if (d.value != null) input.value = d.value;
		if (d.required) input.required = true;
		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			<element-input-range>
				${input}
			</element-input-range>
		</div>`;
	},
	stylesheets: [
		'../ui/lib/range-slider.css',
		'../ui/input-range.css'
	],
	scripts: [
		'../ui/lib/range-slider.min.js',
		'../ui/input-range.js'
	]
};

Pageboard.elements.input_checkbox = {
	title: 'Checkbox',
	menu: "form",
	required: ["name"],
	group: 'input',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string"
		},
		required: {
			title: 'required',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		label: 'inline*'
	},
	icon: '<i class="checkmark box icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var input = doc.dom`<input type="checkbox" name="${d.name}" />`;
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		return doc.dom`<div class="field">
			<div class="ui checkbox">
				${input}
				<label block-content="label">Label</label>
			</div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/checkbox.css'
	]
};


Pageboard.elements.input_select = {
	title: 'Select',
	menu: "form",
	required: ["name"],
	group: 'input',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string"
		},
		placeholder: {
			title: "placeholder",
			type: ["string", "null"]
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
	icon: '<i class="caret down icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var select = doc.dom`<element-select class="ui selection dropdown">
			<div class="menu" block-content="options"></div>
		</element-select>`;

		if (d.name) select.dataset.name = d.name;
		if (d.required) {
			select.dataset.required = true;
		}
		if (d.multiple) {
			select.classList.add('multiple');
			select.dataset.multiple = true;
		}
		if (d.placeholder) {
			select.dataset.placeholder = d.placeholder;
		}
		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			${select}
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/dropdown.css',
		'/.pageboard/semantic-ui/components/label.css'
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
			type: ["string", "null"]
		}
	},
	contents: {
		label: {
			title: 'Label',
			spec: 'inline*'
		}
	},
	render: function(doc, block) {
		// add selected class if selected ?
		var node = doc.dom`<element-select-option class="item" block-content="label"></element-select-option>`;
		var val = block.data.value;
		if (val != null) node.dataset.value = val;
		return node;
	},
	helpers: [
		'../ui/select-helper.js'
	]
};

Pageboard.elements.form_message = {
	title: 'Message',
	menu: "form",
	group: 'input',
	properties: {
		type: {
			title: "type",
			description: "Message is shown depending on type",
			default: "success",
			oneOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "error",
				title: "Error"
			}]
		}
	},
	contents: {
		message: {
			title: 'Message',
			spec: "block+"
		}
	},
	icon: '<i class="announcement icon"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="ui message ${block.data.type}" block-content="message">Message</div>`
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/message.css'
	]
};
