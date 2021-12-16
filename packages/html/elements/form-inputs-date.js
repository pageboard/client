exports.input_date_time = {
	title: 'DateTime',
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
			format: "singleline"
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
			title: 'Step',
			description: 'rounding/increment in seconds',
			type: 'integer',
			nullable: true,
			anyOf: [{
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
			}]
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<input name="[name]" disabled="[disabled]" placeholder="[placeholder]"
			required="[required]" value="[value]" step="[step|magnet:]" type="[format|eq:datetime:datetime-local:]"
		/>
	</div>`
};

exports.input_date_slot = {
	title: 'DateSlot',
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
			format: "singleline"
		},
		nameEnd: {
			title: "Name for end date",
			description: "The form object key",
			type: "string",
			format: "singleline"
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
		timeZone: exports.input_date_time.properties.timeZone
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-slot data-time-zone="[timeZone]" data-step="[step|magnet:]">
			<input name="[nameStart]" value="[valueStart]" />
			<input name="[nameEnd]" value="[valueEnd]" />
		</element-input-date-slot>
	</div>`,
	scripts: [
		'../ui/input-date-slot.js'
	]
};
