exports.input_file = {
	title: 'Upload',
	icon: '<i class="upload icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block input_field",
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
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
		<div class="ui basic label"></div>
		<input is="element-input-file" type="file" id="[$id]" required="[required]"
			disabled="[disabled]" accept="[limits.types|join:,]" name="[name]" />
	</div>`,
	stylesheets: [
		'../ui/components/input.css',
		'../ui/components/label.css',
		'../ui/input-file.css'
	],
	scripts: [
		'../ui/input-file.js'
	]
};
