
Pageboard.elements.form = {
	title: 'Form',
	group: 'block',
	properties: {
		method: {
			title: 'Method',
			oneOf: [{
				const: "post",
				title: "Add"
			}, {
				const: "put",
				title: "Modify"
			}, {
				const: "delete",
				title: "Remove"
			}]
		},
		cast: {
			title: 'Cast to...',
			oneOf: [{
				type: 'string',
				title: 'Custom'
			}, {
				const: 'user',
				title: 'User'
			}]
		},
		schema: {
			type: 'object'
		},
		bindable: {
			title: 'Binds block from query',
			type: 'boolean',
			default: false
		}
//		url: {
//			// after action
//		}

	},
	contents: {
		form: {
			spec: '(block|input)+ input_submit',
			title: 'form'
		}
	},
	icon: '<i class="icon file outline"></i>',
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<form action="${d.action}" method="${d.method}" class="ui form">
			<input type="hidden" name="parent" value="${block.id}" />
			<input type="hidden" name="type" value="${d.cast}" />
			<div block-content="form"></div>
		</form>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/form.css',
//		'../ui/form.css'
	],
	scripts: [
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
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		var node = doc.dom`<div class="field">
			<label block-content="label"></label>
			${input}
		</div>`;
		return node;
	}
};

