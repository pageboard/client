exports.input_otp = {
	title: 'OTP',
	icon: '<i class="icons"><i class="text cursor icon"></i><i class="corner lock icon"></i></i>',
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
	html: `<div class="otp field">
		<label block-content="label">Label</label>
		<input is="element-input-otp" name="[name]"
			required="[required]"
			readonly="[readonly]"
			disabled="[disabled]"
			value="[value]"
			inputmode="numeric"
			maxlength="6"
			pattern="\\d{6}"
			autocomplete="off" />
	</div>`,
	stylesheets: ['../ui/otp.css'],
	scripts: ['../ui/otp.js']
};
