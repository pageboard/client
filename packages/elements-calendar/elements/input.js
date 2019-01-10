Pageboard.elements.IntlPolyfill = {
	priority: -102, // before polyfill element
	install: function(scope) {
		var lang = (scope.$site.lang || window.navigator.language || 'en').substring(0, 2);
		this.polyfills = [`Intl.~locale.${lang}`];
	}
};
Pageboard.elements.input_date_time = {
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
		}
	},
	contents: {
		label: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-time
			format="[format]"
			data-value="[value]"
		><input name="[name]" disabled="[disabled]" placeholder="[placeholder]"
			required="[required]" step="[step]"
		/></element-input-date-time>
	</div>`,
	stylesheets: [
		'../ui/input-date-time.css'
	],
	scripts: [
		'../ui/calendar.js',
		'../lib/datetime.js',
		'../ui/input-date-time.js'
	]
};

Pageboard.elements.input_date_slot = {
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
		}
	},
	contents: {
		label: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<element-input-date-slot data-start="[valueStart]" data-end="[valueEnd]">
			<element-input-date-time><input type="text" name="[nameStart]" /></element-input-date-time>
			<element-input-date-time><input type="text" name="[nameEnd]" /></element-input-date-time>
		</element-input-date-slot>
	</div>`,
	scripts: [
		'../lib/datetime.js',
		'../ui/input-date-slot.js'
	]
};
