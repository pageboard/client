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
					oneOf: [{
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
					oneOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				},
				vars: {
					title: 'Variables',
					description: "list of path.to.key -> form.key",
					oneOf: [{
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
		'../semantic-ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../ui/lib/formdata.min.js',
		'../ui/form.js'
	]
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
		for (var i=0; i < list.length; i++) {
			propKey = list[i];
			prop = prop.properties && prop.properties[propKey] || null;
			if (prop == null) break;
		}
		if (!prop) {
			return node;
		}
		node.textContent = "";
		if (prop.oneOf) {
			if (prop.oneOf.length <= d.radios) {
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
				prop.oneOf.forEach(function(item) {
					if (item.type == "null" && d.multiple) return;
					content.appendChild(view.render({
						type: d.multiple ? 'input_checkbox' : 'input_radio',
						data: {
							name: name,
							value: item.const,
							disabled: d.disabled
						},
						content: {
							label: item.title
						}
					}));
				});
			} else {
				var frag = doc.createDocumentFragment();
				prop.oneOf.forEach(function(item) {
					if (item.type == "null" && d.multiple) return;
					var option = view.render({
						type: 'input_select_option',
						data: {
							value: item.const
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
						disabled: d.disabled
					},
					content: {
						label: prop.title,
						options: frag
					}
				});
				node.appendChild(select);
			}
		} else if (prop.type == "integer") {
			if (prop.minimum != null && prop.maximum != null) {
				if (prop.maximum - prop.minimum <= d.range) {
					return node.appendChild(view.render({
						type: 'input_range',
						data: {
							name: name,
							min: prop.minimum,
							max: prop.maximum,
							default: prop.default,
							disabled: d.disabled
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
					type: 'text',
					format: 'number',
					default: prop.default,
					disabled: d.disabled
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
					type: 'text',
					disabled: d.disabled
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
			oneOf: [{
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
		var alt = type && this.properties.type.oneOf.find(function(obj) {
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
		var input = doc.dom`<input type="file" name="${d.name}" />`;
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		if (d.disabled) input.disabled = true;
		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			<element-input-file class="ui action input" ${d.now ? 'data-now' : ''}>
				${input}
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
		if (d.value != null) input.value = d.value;
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
		var input = doc.dom`<input type="radio" name="${d.name}" value="${d.value}" id="for${id}" />`;
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
	helpers: [
		'../ui/select-helper.js'
	]
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
			oneOf: [{
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
