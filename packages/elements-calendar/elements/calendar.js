Pageboard.elements.IntlPolyfill = {
	priority: -102, // before polyfill element
	install: function(doc, page) {
		var lang = (page.site.lang || window.navigator.language || 'en').substring(0, 2);
		this.polyfills = [`Intl.~locale.${lang}`];
	}
};
Pageboard.elements.input_date_time = {
	title: 'DateTime',
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
	icon: '<i class="calendar outline icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var input = doc.dom`<input name="${d.name}" />`;
		var ce = doc.dom`<element-input-date-time format="${d.format}" data-value="${d.value || ''}">${input}</element-input-date-time>`;
		if (d.disabled) input.disabled = true;
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		if (d.step) input.step = d.step;
		var node = doc.dom`<div class="field">
			<label block-content="label">Label</label>
			${ce}
		</div>`;
		return node;
	},
	stylesheets: [
		'../ui/input-date-time.css'
	],
	scripts: [
		'../ui/lib/datetime.js',
		'../ui/input-date-time.js'
	]
};

Pageboard.elements.input_date_slot = {
	title: 'DateSlot',
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
	icon: '<i class="calendar outline icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<div class="field">
			<label block-content="label">Label</label>
			<element-input-date-slot data-start="${d.valueStart}" data-end="${d.valueEnd}">
				<element-input-date-time><input type="text" name="${d.nameStart}" /></element-input-date-time>
				<element-input-date-time><input type="text" name="${d.nameEnd}" /></element-input-date-time>
			</element-input-date-slot>
		</div>`;
	},
	scripts: [
		'../ui/lib/datetime.js',
		'../ui/input-date-slot.js'
	]
};

Pageboard.elements.event = {
	title: 'Event',
	priority: 2, // must install scripts after query element scripts
	menu: "Agenda",
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
	menu: "Agenda",
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

