exports.settings.properties.grants.items.anyOf.push({
	const: 'scheduler',
	$level: 1000,
	title: 'Scheduler',
	description: 'Events, dates, reservations'
});

exports.event = {
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
		opening: {
			title: 'Open reservations',
			description: 'Hours before start of event date',
			type: 'integer',
			nullable: true,
			minimum: 0,
		},
		closing: {
			title: 'Close reservations',
			description: 'Hours before start of event date',
			type: 'integer',
			default: 0,
			minimum: 0,
		},
		reservationRequired: {
			title: 'Require reservation',
			type: 'boolean',
			default: false
		},
		price: {
			title: 'Seat price',
			type: 'number',
			default: 0,
			minimum: 0
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
	}
};


exports.event_date = {
	title: 'Date',
	menu: "Calendar",
	bundle: 'event',
	standalone: true,
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
		price: {
			title: 'Seat price for this date',
			nullable: true,
			type: 'number',
			minimum: 0
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
	standalone: true,
	required: [],
	properties: {
		seats: {
			title: 'Number of reserved seats',
			type: 'integer',
			default: 1,
			minimum: 0
		},
		payment: {
			title: 'Payment',
			type: 'object',
			required: [],
			properties: {
				due: {
					title: 'Amount due',
					type: 'number',
					minimum: 0,
					default: 0
				},
				paid: {
					title: 'Amount paid',
					type: 'number',
					minimum: 0,
					default: 0
				},
				method: {
					title: 'Payment method',
					type: 'string'
				}
			}
		},
		attendees: {
			title: 'Attendees',
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						title: 'Name',
						type: 'string'
					},
					surname: {
						title: 'Surname',
						type: 'string'
					}
				}
			},
			nullable: true
		},
		contact: {
			title: 'Contact',
			type: 'object',
			properties: {
				name: {
					title: 'Name',
					type: 'string'
				},
				phone: {
					title: 'Phone',
					type: 'string',
					pattern: /^(\(\d+\))? *\d+([ .-]?\d+)*$/.source
				}
			}
		},
		comment: {
			title: 'Comment',
			type: 'string'
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

