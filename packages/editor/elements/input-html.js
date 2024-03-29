exports.input_html = {
	title: 'Input HTML',
	icon: '<i class="icons"><i class="text cursor icon"></i><i class="corner pencil alternate icon"></i></i>',
	menu: "form",
	required: ["name"],
	group: "block input_field",
	bundle: true,
	context: 'form//',
	properties: {
		name: {
			title: "Name",
			description: "The form object key",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
		},
		value: {
			title: "Default value",
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
		readonly: {
			title: 'Read only',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<textarea is="element-input-html"
			name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
		>[value|as:html]</textarea>
	</div>`,
	scripts: [
		'../lib/editor.js',
		'../ui/input-html.js'
	],
	stylesheets: [
		'../ui/input-html.css'
	]
};
