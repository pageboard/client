Pageboard.elements.event = {
	title: 'Event',
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
			title: 'Time slot',
			type: 'object',
			properties: {
				date: {
					title: 'Date',
					format: 'date',
					type: 'string'
				},
				start: {
					title: 'Start',
					format: 'time', // FIXME inputTime ?
					type: 'string'
				},
				end: {
					title: 'End',
					format: 'time',
					type: 'string'
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

