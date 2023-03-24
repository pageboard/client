exports.input_url = {
	title: 'Input URL',
	icon: '<i class="icons"><i class="text cursor icon"></i><i class="corner linkify icon"></i></i>',
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
		types: {
			title: 'Types',
			description: 'Usage of the URL',
			type: 'array',
			items: {
				anyOf: [
					{ const: 'link', title: 'Link' },
					{ const: 'embed', title: 'Embed' },
					{ const: 'image', title: 'Image' },
					{ const: 'video', title: 'Video' },
					{ const: 'audio', title: 'Audio' }
				]
			},
			default: ['link']
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<input is="element-input-url" type="url" id="[$id]" required="[required]"
			disabled="[disabled]" accept="[types|join:,]" name="[name]" placeholder="[placeholder]" />
	</div>`,
	stylesheets: [
		'../ui/input-url.css'
	],
	scripts: [
		'../ui/input-url.js'
	]
};
