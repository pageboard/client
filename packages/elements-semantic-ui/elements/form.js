// Nota Bene
// query forms initialize their inputs from document.location's query
Pageboard.elements.form = {
	title: 'Form',
	group: 'block',
	menu: "form",
	priority: 0, // scripts must run before 'query' scripts
	required: ["action"],
	properties: {
		fill: {
			title: 'Fill using query',
			description: 'Use vars id: `query name` to fetch block',
			type: 'boolean',
			default: false
		},
		action: {
			title: 'Action',
			type: 'object',
			properties: {
				method: {
					title: 'Method',
					anyOf: [{
						const: "get",
						title: "query url"
					}, {
						const: "post",
						title: "submit data"
					}],
					default: "get"
				},
				live: {
					title: 'Submit on input',
					type: 'boolean',
					default: false
				},
				call: {
					title: 'Call api or url',
					description: 'Leave empty for current url',
					type: ["null", "string"],
					pattern: "^((\\w+\.\\w+)|((/[\\w-.]*)+)|)$"
				},
				type: {
					title: 'Bind to element',
					description: 'Checks schema and helps adding form controls',
					type: ['null', 'string'],
					input: {
						name: 'element'
					}
				},
				consts: {
					title: 'Constants',
					description: 'list of path.to.key -> value',
					anyOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "list of path.to.key -> form.key",
					anyOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				/* TODO schema could be built out of form controls
				in which case action.type cannot be set
				schema: {
					description: "The schema defined by the form controls - private",
					type: ["null", "object"]
				},
				*/
			}
		},
		redirection: {
			title: 'Redirection',
			description: 'Optional after successful submission',
			type: 'object',
			properties: {
				url: {
					title: 'Address',
					anyOf: [{
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
					anyOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "Client input",
					anyOf: [{
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
			spec: 'block+'
		}
	},
	icon: '<i class="write icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var action = d.action || {};
		var url = action.method == "get" ? action.call : "/.api/form";
		var fetch = '';
		if (action.vars && Object.keys(action.vars).indexOf('id') >= 0) {
			fetch = doc.dom`<input type="hidden" name="${action.vars.id}" data-fetch />`;
		}
		var form = doc.dom`<form action="${url}" method="${action.method}" class="ui form">
			<input type="hidden" name="_id" value="${block.id}" />
			${fetch}
			<div block-content="form"></div>
		</form>`;
		if (action.live) form.dataset.live = true;
		if (action.type) form.dataset.type = action.type;
		if (d.fill) form.dataset.fill = true;
		return form;
	},
	stylesheets: [
		'../semantic-ui/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../lib/formdata.js',
		'../ui/form.js'
	],
	polyfills: ['fetch'] // unfortunately there is no formdata polyfill available right now
};

Pageboard.elements.input_property = {
	title: 'Property',
	menu: 'form',
	group: 'block',
	context: 'form//',
	icon: '<i class="icon">X</i>',
	properties: {
		name: {
			title: 'name',
			type: 'string',
			input: {
				name: 'element-property'
			}
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
			default: false
		},
		radios: {
			title: 'Show radios if less than',
			description: 'If number of options is over this number, show a <select>',
			type: 'integer',
			default: 5
		},
		range: {
			title: 'Show range if interval less than',
			type: 'integer',
			default: 10
		},
		multiple: {
			title: 'Allow multiple choices',
			type: 'boolean',
			default: false
		},
		foldable: {
			title: 'Foldable',
			type: 'boolean',
			default: false
		},
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
		}
	},
	render: function(doc, block, view) {
		var d = block.data;
		var name = d.name;
		var node = doc.dom`<div><code>select property name</code></div>`;
		if (!name) {
			return node;
		}
		var list = name.split('.');
		var el = view.element(list[0]);
		if (!el) {
			return node;
		}
		// list[0] = "data";
		// /.api/form wraps it into block.data
		list.shift();
		name = list.join('.');
		var prop = el;
		var propKey;
		var required = false;
		for (var i=0; i < list.length; i++) {
			propKey = list[i];
			required = prop.required && prop.required.indexOf(propKey) >= 0;
			prop = prop.properties && prop.properties[propKey] || null;
			if (prop == null) break;
		}
		if (!prop) {
			return node;
		}
		node.textContent = "";
		var listOf = prop.anyOf || prop.oneOf;
		var propType;
		if (listOf) {
			var listOfNo = listOf.filter(function(item) {
				return item.type != "null";
			});
			if (listOfNo.length != listOf.length) {
				required = false;
			}
			if (listOfNo.length == 1 && listOfNo[0].const === undefined) {
				propType = listOfNo[0];
				listOf = null;
			} else if (d.multiple) {
				listOf = listOfNo;
			}
		} else if (Array.isArray(prop.type)) {
			listOf = prop.type.filter(function(type) {
				if (type == "null") {
					required = false;
					return false;
				} else {
					return true;
				}
			});
			if (listOf.length == 1) {
				propType = listOf[0];
				listOf = null;
			} else {
				listOf = null; // cannot deal with this for now
			}
		}
		if (!propType) propType = prop;

		if (listOf) {
			if (listOf.length <= d.radios) {
				var content = doc.dom`<div class="content"></div>`;
				if (d.foldable) {
					node.appendChild(doc.dom`<element-accordion class="grouped fields">
						<label for="${name}" class="title active caret-icon">${prop.title}</label>
						${content}
					</element-accordion>`);
				} else {
					node.appendChild(doc.dom`<div class="grouped fields">
						<label for="${name}" class="title">${prop.title}</label>
						${content}
					</div>`);
				}
				listOf.forEach(function(item) {
					content.appendChild(view.render({
						type: d.multiple ? 'input_checkbox' : 'input_radio',
						data: {
							name: name,
							value: item.type == "null" ? null : item.const,
							disabled: d.disabled
						},
						content: {
							label: item.title
						}
					}));
				});
			} else {
				var frag = doc.createDocumentFragment();
				listOf.forEach(function(item) {
					var option = view.render({
						type: 'input_select_option',
						data: {
							value: item.type == "null" ? null : item.const
						},
						content: {
							label: item.title
						}
					});
					frag.appendChild(option);
				});
				var select = view.render({
					type: 'input_select',
					data: {
						name: name,
						multiple: d.multiple,
						placeholder: prop.description,
						disabled: d.disabled,
						required: required,
						template: d.template
					},
					content: {
						label: prop.title,
						options: frag
					}
				});
				node.appendChild(select);
			}
		} else if (propType.type == "integer") {
			if (propType.minimum != null && propType.maximum != null) {
				if (propType.maximum - propType.minimum <= d.range) {
					return node.appendChild(view.render({
						type: 'input_range',
						data: {
							name: name,
							min: propType.minimum,
							max: propType.maximum,
							value: propType.default,
							disabled: d.disabled,
							required: required,
							template: d.template,
							step: 1
						},
						content: {
							label: prop.title
						}
					}));
				}
			}
			node.appendChild(view.render({
				type: 'input_text',
				data: {
					name: name,
					type: 'number',
					default: propType.default,
					disabled: d.disabled,
					required: required,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "boolean") {
			node.appendChild(view.render({
				type: 'input_checkbox',
				data: {
					name: name,
					value: "true",
					disabled: d.disabled,
					required: required,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "string" && propType.format == "date") {
			node.appendChild(view.render({
				type: 'input_date_time',
				data: {
					name: name,
					type: propType.format,
					default: propType.default,
					disabled: d.disabled,
					required: required,
					step: propType.step,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "string" && propType.format == "time") {
			node.appendChild(view.render({
				type: 'input_date_time',
				data: {
					name: name,
					type: propType.format,
					default: propType.default,
					disabled: d.disabled,
					required: required,
					step: propType.step,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else {
			var input = view.render({
				type: 'input_text',
				data: {
					name: name,
					type: propType.format == 'singleline' ? 'text' : 'textarea',
					disabled: d.disabled,
					default: propType.default,
					required: required,
					template: d.template
				},
				content: {
					label: prop.title
				}
			});
			node.appendChild(input);
		}
		return node;
	},
	stylesheets: [
		'../semantic-ui/accordion.css',
		'../ui/accordion.css'
	],
	scripts: [
		'../ui/accordion.js'
	]
};

Pageboard.elements.fieldset = {
	title: 'Fieldset',
	menu: 'form',
	group: 'block',
	context: 'form//',
	icon: '<i class="folder outline icon"></i>',
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
	render: function(doc, block) {
		var node = doc.dom`<fieldset block-content="content"></fieldset>`;
		if (block.data.plain) node.classList.add('plain');
		return node;
	}
};

Pageboard.elements.fieldset_legend = {
	inplace: "true",
	contents: {
		legend: "inline*"
	},
	render: function(doc, block) {
		return doc.dom`<legend block-content="legend">Title</legend>`;
	}
};

Pageboard.elements.input_button = {
	title: 'Button',
	menu: "form",
	group: "block",
	context: 'form//',
	icon: '<i class="hand pointer icon"></i>',
	contents: {
		label: "text*"
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
		}
	},
	render: function(doc, block) {
		var type = block.data.type || 'submit';
		var alt = type && this.properties.type.anyOf.find(function(obj) {
			return obj.const == type;
		});
		var title = alt && alt.title || 'Submit';
		var node =  doc.dom`<button class="ui button" block-content="label">${title}</button>`;
		node.type = type;
		return node;
	},
	stylesheets: [
		'../semantic-ui/button.css',
	]
};

Pageboard.elements.input_text = {
	title: 'Input',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
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
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
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
		if (d.disabled) input.disabled = true;
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		if (d.template) input.dataset.value = d.template;
		var node = doc.dom`<div class="field">
			<label block-content="label">Label</label>
			${input}
		</div>`;
		if (d.type == "hidden") node.classList.add('hidden');
		return node;
	}
};

Pageboard.elements.input_file = {
	title: 'Upload',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
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
	icon: '<i class="upload icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var inputFile = doc.dom`<input type="file" />`;
		var inputText = doc.dom`<input type="text" name="${d.name}" />`;
		if (d.placeholder) {
			inputText.placeholder = inputFile.placeholder = d.placeholder;
		}
		if (d.required) {
			inputText.required = inputFile.required = true;
		}
		if (d.disabled) {
			inputText.disabled = inputFile.disabled = true;
		}

		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			<element-input-file class="ui action input" ${d.now ? 'data-now' : ''}>
				${inputText}
				${inputFile}
				<div class="ui icon button">
					<i class="upload icon"></i>
					<i class="delete icon"></i>
				</div>
				<div class="mini floating ui basic label"></div>
			</element-input-file>
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/input.css',
		'../semantic-ui/label.css',
		'../ui/input-file.css'
	],
	scripts: [
		'../ui/input-file.js'
	]
};

Pageboard.elements.input_range = {
	title: 'Range',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string"
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
	icon: '<i class="options icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var input = doc.dom`<input type="range" name="${d.name}" min="${d.min}" max="${d.max}" step="${d.step}" />`;
		if (d.value != null) {
			input.value = d.value;
			input.dataset.default = d.value; // we need to keep track of initial value for disabling trick
		}
		if (d.required) input.required = true;
		if (d.disabled) input.disabled = true;
		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			<element-input-range>
				${input}
			</element-input-range>
		</div>`;
	},
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
	menu: "form",
	group: "block",
	context: 'form//',
	required: ["name"],
	properties: {
		name: {
			title: "name",
			type: "string"
		},
		value: {
			title: "value",
			type: "string"
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
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
		}
	},
	contents: {
		label: 'inline*'
	},
	icon: '<i class="checkmark box icon"></i>',
	render: function(doc, block, view) {
		var d = block.data;
		var id = (block.id || view.blocks.genId(4)).substring(0, 4);
		var input = doc.dom`<input type="checkbox" name="${d.name}" value="${d.value}" id="for${id}" />`;
		if (d.required) input.required = true;
		if (d.disabled) input.disabled = true;
		if (d.template) input.dataset.checked = d.template;
		return doc.dom`<div class="field">
			<div class="ui checkbox">
				${input}
				<label block-content="label" for="for${id}">Label</label>
			</div>
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/checkbox.css'
	]
};

Pageboard.elements.input_radio = {
	title: 'Radio',
	menu: "form",
	group: "block",
	context: 'form//',
	required: ["name"],
	properties: {
		name: {
			title: "name",
			type: "string"
		},
		value: {
			title: "value",
			type: "string"
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
	icon: '<i class="selected radio icon"></i>',
	render: function(doc, block, view) {
		var d = block.data;
		var id = (block.id || view.blocks.genId(4)).substring(0, 4);
		var val = d.value == null ? '' : d.value;
		var input = doc.dom`<input type="radio" name="${d.name}" value="${val}" id="for${id}" />`;
		if (d.disabled) input.disabled = true;
		return doc.dom`<div class="field">
			<div class="ui radio checkbox">
				${input}
				<label block-content="label" for="for${id}">Label</label>
			</div>
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/checkbox.css'
	]
};

Pageboard.elements.input_select = {
	title: 'Select',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
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
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
		},
		value: {
			title: "default value",
			type: ["string", "null"]
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
		if (d.disabled) {
			select.dataset.disabled = true;
		}
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
		if (d.value) {
			select.setAttribute('value', d.value);
		}
		if (d.template) {
			select.dataset.value = d.template;
		}
		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			${select}
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/dropdown.css',
		'../semantic-ui/label.css'
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
	resources: [
		'../ui/select-helper.js'
	],
	install: function(doc, page, view) {
		if (Pageboard.write) this.scripts = this.resources;
	}
};

Pageboard.elements.form_message = {
	title: 'Message',
	menu: "form",
	group: "block",
	context: 'form//',
	properties: {
		type: {
			title: "type",
			description: "Message is shown depending on type",
			default: "success",
			anyOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "warning",
				title: "Not found"
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
		'../semantic-ui/message.css'
	]
};
