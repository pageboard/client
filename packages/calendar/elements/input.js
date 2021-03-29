exports.input_date_time = {
	title: 'DateTime',
	icon: '<i class="calendar outline icon"></i>',
	menu: "form",
	required: ["name"],
	group: "block",
	context: 'form//',
	properties: {
		name: {
			title: "name",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		value: {
			title: "default value",
			nullable: true,
			type: "string",
			format: "singleline"
		},
		placeholder: {
			title: "placeholder",
			nullable: true,
			type: "string",
			format: "singleline"
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
		format: {
			title: 'format',
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
			title: 'step',
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
			}, {
				const: 60 * 60 * 12,
				title: '12 hours'
			}, {
				const: 60 * 60 * 24,
				title: '1 day'
			}]
		},
		timeZone: {
			title: 'Time Zone',
			description: 'Sets a time zone name from https://www.iana.org/time-zones',
			type: 'string',
			format: "singleline"
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-time
			data-format="[format]"
			data-time-zone="[timeZone]"
			data-value="[value]"
			data-step="[step|magnet:]"
		><input name="[name]" disabled="[disabled]" placeholder="[placeholder]"
			required="[required]"
		/></element-input-date-time>
	</div>`,
	stylesheets: [
		'../ui/input-date-time.css'
	],
	scripts: [
		'../lib/datetime.js',
		'../ui/input-date-time.js'
	]
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
			title: "name for start date",
			description: "The form object key",
			type: "string",
			format: "singleline"
		},
		nameEnd: {
			title: "name for end date",
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
			title: 'required',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: 'disabled',
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
		<element-input-date-slot data-start="[valueStart]" data-end="[valueEnd]" data-time-zone="[timeZone]" data-step="[step|magnet:]">
			<element-input-date-time><input name="[nameStart]" /></element-input-date-time>
			<element-input-date-time><input name="[nameEnd]" /></element-input-date-time>
		</element-input-date-slot>
	</div>`,
	scripts: [
		'../lib/datetime.js',
		'../ui/input-date-slot.js'
	]
};
