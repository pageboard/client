
Pageboard.elements.form = {
	title: 'Form',
	group: 'block',
	menu: "form",
	properties: {
		schema: {
			// not editable - deduced from actual form content
			type: 'object'
		},
		action: {
			title: 'Action',
			type: 'object',
			properties: {
				method: {
					title: 'Method',
					oneOf: [{
						const: "get",
						title: "query"
					}, {
						const: "post",
						title: "submit"
					}]
				},
				call: {
					title: 'Call api or url',
					type: "string",
					pattern: "^(\\w+\.\\w+)|((/[\\w-.]*)+)$",
					/* TODO improve this input with a selector
					input: {
						name: 'href',
						filter: {
							type: ["api"]
						}
					} */
				}
			}
		},
		redirect: {
			title: 'Redirect',
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
//		from: {
//			title: 'Block id from query key',
//			description: 'Fill form using the block whose id is found is url query',
//			type: ['string', 'null']
//		},
		reaction: {
			title: 'Reaction',
			description: 'Additional action after successful form submission',
			type: 'object',
			properties: {
				method: {
					title: 'Method',
					oneOf: [{
						const: "get",
						title: "query"
					}, {
						const: "post",
						title: "submit"
					}]
				},
				call: {
					title: 'Call api or url',
					oneOf: [{
						type: "null"
					}, {
						type: "string",
						pattern: "^(\\w+\.\\w+)|((/[\\w-.]*)+)$"
					}]
					/* TODO improve this input with a selector
					input: {
						name: 'href',
						filter: {
							type: ["api"]
						}
					} */
				},
				data: {
					title: 'Data',
					description: 'Use req.id or res.id, res.data.url...',
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
			spec: '(block|input)+ input_submit',
			title: 'form'
		}
	},
	icon: '<i class="write icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		if (!d.action) d.action = {};
		return doc.dom`<form action="/.api/form" method="${d.action.method}" class="ui form">
			<input type="hidden" name="parent" value="${block.id}" />
			<div block-content="form"></div>
		</form>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/form.css'
	],
	scripts: [
		'../ui/formdata.min.js',
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
