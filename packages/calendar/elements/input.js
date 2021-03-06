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
			type: "string"
		},
		value: {
			title: "default value",
			nullable: true,
			type: "string"
		},
		placeholder: {
			title: "placeholder",
			nullable: true,
			type: "string"
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
			description: 'increments in seconds',
			type: 'integer',
			default: 0
		},
		timeZone: {
			title: 'Time Zone',
			description: 'Sets a time zone name from https://www.iana.org/time-zones',
			type: 'string'
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-time
			format="[format]"
			time-zone="[timeZone]"
			value="[value]"
		><input name="[name]" disabled="[disabled]" placeholder="[placeholder]"
			required="[required]" step="[step]"
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
			type: "string"
		},
		nameEnd: {
			title: "name for end date",
			description: "The form object key",
			type: "string"
		},
		valueStart: {
			title: 'Start time',
			nullable: true,
			type: "string"
		},
		valueEnd: {
			title: 'End time',
			nullable: true,
			type: "string"
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
		step: {
			title: 'step',
			description: 'increments in seconds for start/end times',
			type: 'integer',
			default: 0
		},
		timeZone: {
			title: 'Time Zone',
			description: 'Sets a time zone name from https://www.iana.org/time-zones',
			type: 'string'
		}
	},
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-slot start="[valueStart]" end="[valueEnd]" time-zone="[timeZone]">
			<element-input-date-time><input type="text" name="[nameStart]" /></element-input-date-time>
			<element-input-date-time><input type="text" name="[nameEnd]" /></element-input-date-time>
		</element-input-date-slot>
	</div>`,
	scripts: [
		'../lib/datetime.js',
		'../ui/input-date-slot.js'
	]
};
