exports.input_file = {
	title: 'Upload',
	icon: '<i class="upload icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
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
		now: {
			title: 'Upload on change',
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
					title: 'Files',
					description: 'Max number of files',
					type: 'integer',
					minimum: 1,
					default: 1
				}
			}
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-file class="ui action input" data-now="[now]">
			<input type="text" name="[name]" placeholder="[placeholder]" />
			<input type="file" id="[$id]" required="[required]"
				disabled="[disabled]" multiple="[limits.files|gt:1|battr]" />
			<label for="[$id]" class="ui icon button">
				<i class="upload icon"></i>
				<i class="delete icon"></i>
			</label>
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
