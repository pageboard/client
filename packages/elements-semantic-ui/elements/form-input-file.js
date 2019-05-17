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
		},
		limits: {
			title: 'Limits',
			type: 'object',
			properties: {
				size: {
					title: 'Size',
					description: 'Max file size in octets',
					type: 'integer',
					nullable: true
				},
				types: {
					title: 'Types',
					description: 'Content type patterns',
					type: 'array',
					items: {
						type: 'string'
					},
					default: ['*/*']
				},
				files: {
					type: 'integer',
					minimum: 1,
					default: 1
				}
			}
		}
	},
	contents: {
		label: 'inline*'
	},
	icon: '<i class="upload icon"></i>',
	render: function(doc, block) {
		var id = (block.id || '').slice(0, 4);
		var d = block.data;
		var inputFile = doc.dom`<input type="file" id="id-${id}" />`;
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
				<label for="id-${id}" class="ui icon button">
					<i class="upload icon"></i>
					<i class="delete icon"></i>
				</label>
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
