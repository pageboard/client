
Pageboard.elements.form = {
	title: 'Form',
	group: 'block',
	properties: {
		schema: {
			// not editable - deduced from actual form content
			type: 'object'
		},
		action: {
			title: 'Action',
			description: 'where and how to submit this form',
			type: 'object',
			properties: {
				method: {
					title: 'Method',
					oneOf: [{
						const: "get",
						title: "Get"
					}, {
						const: "post",
						title: "Add"
					}, {
						const: "put",
						title: "Save"
					}, {
						const: "delete",
						title: "Remove"
					}]
				},
				url: {
					title: 'Action url',
					description: 'url to submit the form to',
					type: "string",
					pattern: "^(/[\\w-.]*)+$",
					/* TODO use type "api" to list available /.api services
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
						title: "Get"
					}, {
						const: "post",
						title: "Add"
					}, {
						const: "put",
						title: "Save"
					}, {
						const: "delete",
						title: "Remove"
					}]
				},
				url: {
					title: 'Reaction url',
					description: 'url to submit the form to',
					oneOf: [{
						type: "null"
					}, {
						type: "string",
						pattern: "^(/[\\w-.]*)+$"
					}]
				},
				data: {
					title: 'Data',
					description: 'Accepts template strings - with data or query variables',
					type: "object"
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
		var node = doc.dom`<form action="${d.action.url}" method="${d.action.method}" class="ui form">
			<input type="hidden" name="parent" value="${block.id}" />
			<div block-content="form"></div>
		</form>`;
		if (d.redirect) node.dataset.redirect = d.redirect;
		return node;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/form.css',
//		'../ui/form.css'
	],
	scripts: [
		'../ui/formdata.min.js',
		'../ui/form.js'
	]
};

Pageboard.elements.input_submit = {
	contents: {
		label: "text*"
	},
	render: function(doc, block) {
		return doc.dom`<button type="submit" class="ui button" block-content="label">Submit</button>`;
	}
};

Pageboard.elements.input_text = {
	title: 'Input',
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
		var input = doc.dom`<input type="${d.type}" name="${d.name}" />`;
		if (d.value) input.value = d.value;
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		var node = doc.dom`<div class="field">
			<label block-content="label"></label>
			${input}
		</div>`;
		if (d.type == "hidden") node.classList.add('hidden');
		return node;
	}
};

Pageboard.elements.input_checkbox = {
	title: 'Checkbox',
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
				<label block-content="label"></label>
			</div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/checkbox.css'
	]
};
