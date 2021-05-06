exports.settings.properties.grants.items.anyOf.push({
	const: 'scheduler',
	$level: 1000,
	title: 'Scheduler',
	description: 'Events, dates, reservations'
});

exports.event = {
	priority: 2, // must install scripts after query element scripts
	title: 'Event',
	menu: "Calendar",
	bundle: true,
	standalone: true,
	required: ['title'],
	properties: {
		title: {
			title: 'Event title',
			type: "string"
		},
		url: {
			title: 'Event page',
			type: "string",
			format: "pathname",
			nullable: true,
			$helper: {
				name: 'page',
				type: 'page'
			}
		},
		groupsOnly: {
			title: 'For groups only',
			type: 'boolean',
			default: false
		},
		minSeatsReservations: {
			title: 'Min. number of seats per reservation',
			type: 'integer',
			default: 0,
			minimum: 0
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
		},
		venue: {
			title: 'Venue',
			type: 'string'
		},
		label: {
			title: 'Label',
			anyOf: [{const: 'default', title: 'Default'}]
		}
	},
	scripts: ['../ui/calendar.js']
};


exports.event_date = {
	title: 'Date',
	menu: "Calendar",
	bundle: 'event',
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
		details: {
			title: 'Custom details',
			type: 'object',
			default: {}
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

exports.event_reservation = {
	title: 'Reservation',
	menu: "Calendar",
	bundle: 'event',
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
			pattern: '^(\\(\\d+\\))? *\\d+([ .\\-]?\\d+)*$'
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
					title: 'User Settings',
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
					title: 'Event Date',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

