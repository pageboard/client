exports.input_date_time = {
	title: 'Date Time',
	icon: '<i class="calendar outline icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
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
		format: {
			title: 'Format',
			default: "datetime",
			anyOf: [{
				const: "datetime",
				title: "Date-Time"
			}, {
				const: "date",
				title: "Date"
			}, {
				const: "time",
				title: "Time"
			}]
		},
		step: {
			title: 'Time steps',
			description: 'Ignored for dates',
			default: null,
			anyOf: [{
				const: null,
				title: '1 minute'
			}, {
				const: 60
			}, {
				const: 60 * 5,
				title: '5 minutes'
			}, {
				const: 60 * 15,
				title: '15 minutes'
			}, {
				const: 60 * 30,
				title: '30 minutes'
			}, {
				const: 60 * 60,
				title: '1 hour'
			}, {
				const: 86400,
				title: '1 day'
			}]
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<input is="element-input-date"
			name="[name]" disabled="[disabled]" placeholder="[placeholder]"
			required="[required]" value="[value]" step="[step]"
			type="[format|switch:datetime:datetime-local]"
		/>
	</div>`,
	scripts: [
		'../ui/input-date.js'
	]
};

exports.input_date_slot = {
	title: 'Date Slot',
	icon: '<i class="calendar outline icon"></i>',
	menu: "form",
	required: ["nameStart", "nameEnd"],
	group: "block",
	context: 'form//',
	properties: {
		nameStart: {
			title: "Name for start date",
			description: "The form object key",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
		},
		nameEnd: {
			title: "Name for end date",
			description: "The form object key",
			type: "string",
			format: "singleline",
			$helper: 'element-property'
		},
		valueStart: {
			title: 'Start time',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		valueEnd: {
			title: 'End time',
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
		step: exports.input_date_time.properties.step,
		format: exports.input_date_time.properties.format
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-slot type="[format|switch:datetime:datetime-local]" step="[step]">
			<input is="element-input-date" name="[nameStart]" value="[valueStart]" />
			<input is="element-input-date" name="[nameEnd]" value="[valueEnd]" />
		</element-input-date-slot>
	</div>`,
	scripts: [
		'../ui/input-date-slot.js'
	]
};
