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
			type: ["string", "null"]
		},
		placeholder: {
			title: "placeholder",
			type: ["string", "null"]
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
			type: ["string", "null"]
		},
		valueEnd: {
			title: 'End time',
			type: ["string", "null"]
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

Pageboard.elements.event = {
	priority: 2, // must install scripts after query element scripts
	title: 'Event',
	menu: "Calendar",
	required: ['title'],
	properties: {
		title: {
			title: 'Event title',
			type: "string"
		},
		groupsOnly: {
			title: 'For groups only',
			type: 'boolean',
			default: false
		},
		reservationRequired: {
			title: 'Require reservation',
			type: 'boolean',
			default: false
		},
		seats: {
			title: 'Available seats',
			type: 'integer',
			default: 0,
			minimum: 0
		},
		venue: {
			title: 'Venue',
			type: 'string'
		},
		label: {
			title: 'Label',
			type: 'string'
		}
	},
	scripts: ['../ui/calendar.js']
};

Pageboard.elements.event_date = {
	title: 'Date',
	menu: "Calendar",
	properties: {
		groupsOnly: {
			title: 'For groups only',
			anyOf: [{
				type: 'null'
			}, {
				type: 'boolean',
				default: false
			}]
		},
		reservationRequired: {
			title: 'Require reservation',
			anyOf: [{
				type: 'null'
			}, {
				type: 'boolean',
				default: false
			}]
		},
		seats: {
			title: 'Available seats for this date',
			anyOf: [
				{type: 'null'},
				{type: 'integer', minimum: 0}
			]
		},
		reservations: {
			description: 'Use event.subscribe to manage this field',
			type: 'integer',
			default: 0,
			minimum: 0,
			maximum: {
				$data: "1/seats"
			}
		},
		slot: {
			type: 'object',
			title: 'Time slot',
			properties: {
				start: {
					title: 'Start',
					type: 'string',
					format: 'date-time'
				},
				end: {
					title: 'End',
					type: 'string',
					format: 'date-time',
					formatMinimum: {
						$data: "1/start"
					}
				}
			}
		}
	}
};

Pageboard.elements.event_reservation = {
	title: 'Reservation',
	menu: "Calendar",
	required: ['seats', 'name'],
	properties: {
		seats: {
			title: 'Number of reserved seats',
			type: 'integer',
			default: 1,
			minimum: 1
		},
		comment: {
			title: 'Comment',
			type: 'string'
		},
		name: {
			title: 'Name',
			type: 'string'
		},
		phone: {
			title: 'Phone',
			type: 'string',
			pattern: '^\\d+(\\s*\\.*-*\\d+)*$'
		}
	}
};

Pageboard.elements.settings.properties.event = {
	title: 'Event settings',
	type: 'object',
	properties: {
		allowNews: {
			title: 'Allow sending news',
			type: 'boolean',
			default: false
		},
		allowEmail: {
			title: 'Allow emails',
			type: 'boolean',
			default: false
		}
	}
};

