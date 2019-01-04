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
			nullable: true,
			type: 'boolean',
			default: false
		},
		reservationRequired: {
			title: 'Require reservation',
			nullable: true,
			type: 'boolean',
			default: false
		},
		seats: {
			title: 'Available seats for this date',
			nullable: true,
			type: 'integer',
			minimum: 0
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

