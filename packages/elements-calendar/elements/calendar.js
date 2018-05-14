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
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
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
		}
	},
	contents: {
		label: 'inline*'
	},
	icon: '<i class="calendar outline icon"></i>',
	render: function(doc, block) {
		var d = block.data;
		var input = doc.dom`<input data-format="${d.format}" type="text" name="${d.name}" />`;
		var ce = doc.dom`<element-input-date-time>${input}</element-input-date-time>`;
		if (d.value) input.value = d.value;
		if (d.disabled) input.disabled = true;
		if (d.placeholder) input.placeholder = d.placeholder;
		if (d.required) input.required = true;
		if (d.template) ce.dataset.value = d.template;
		if (d.step) input.step = step;
		var node = doc.dom`<div class="field">
			<label block-content="label">Label</label>
			${ce}
		</div>`;
		return node;
	},
	scripts: [
		'../ui/lib/datetime.js',
		'../ui/input-date-time.js'
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
					format: 'date-time'
				}
			}
		}

	}
};

Pageboard.elements.event_reservation = {
	title: 'Reservation',
	required: ['event_date_id', 'user_settings_id'],
	properties: {
		event_date_id: {
			type: 'string',
			pattern: '^[\\w-]+$'
		},
		user_settings_id: {
			type: 'string',
			pattern: '^[\\w-]+$'
		},
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
		timestamp: {
			format: 'date-time',
			type: 'string'
			// default: '' // FIXME use dynamic defaults
		}
	}
};

Pageboard.elements.settings.properties.event = {
	title: 'Event settings',
	type: 'object',
	required: ['name'],
	properties: {
		name: {
			title: 'Name',
			type: 'string'
		},
		phone: {
			title: 'Phone',
			type: 'string',
			pattern: '^\d+(\s*\.*-*\d+)*$'
		},
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

