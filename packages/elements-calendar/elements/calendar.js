Pageboard.elements.event = {
	priority: 2, // must install scripts after query element scripts
	title: 'Event',
	menu: "Calendar",
	group: 'calendar',
	standalone: true,
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
		maxSeatsReservations: {
			title: 'Max. number of seats per reservation',
			type: 'integer',
			default: 10,
			minimum: 1
		},
		openReservations: {
			title: 'Open reservations n seconds before',
			type: 'integer',
			default: 30,
			minimum: 0,
		},
		closeReservations: {
			title: 'Close reservations n seconds before',
			type: 'integer',
			default: 0,
			minimum: 0,
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
		slot: { // TODO set eventDate default to this
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
		},
		venue: {
			title: 'Venue',
			type: 'string'
		},
		label: {
			title: 'Label',
			type: 'string'
		}
	}
};

Pageboard.elements.event_date = {
	title: 'Date',
	menu: "Calendar",
	group: 'calendar',
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
	},
	parents: {
		type: 'array',
		items: [{
			type: 'object',
			properties: {
				type: {
					const: 'event'
				},
				id: {
					title: 'event id',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

Pageboard.elements.event_reservation = {
	title: 'Reservation',
	menu: "Calendar",
	group: 'calendar',
	required: ['seats', 'name'],
	properties: {
		seats: {
			title: 'Number of reserved seats',
			type: 'integer',
			default: 1,
			minimum: 0
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
	},
	parents: {
		type: 'array',
		items: [{
			type: 'object',
			properties: {
				type: {
					const: 'settings'
				},
				id: {
					title: 'user settings id',
					type: 'string',
					format: 'id'
				}
			}
		}, {
			type: 'object',
			properties: {
				type: {
					const: 'event_date'
				},
				id: {
					title: 'event date id',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

