Pageboard.elements.user = {
	priority: -10,
	required: ['email'],
	$lock: [],
	properties: {
		email: {
			type: 'string',
			format: 'email',
			transform: ['trim', 'toLowerCase']
		}
	}
};

Pageboard.elements.priv = {
	priority: -10,
	$lock: [],
	properties: {
		otp: {
			type: 'object',
			properties: {
				secret: {
					type: 'string'
				},
				checked_at: {
					nullable: true,
					type: 'string',
					format: 'date-time'
				},
				tries: {
					type: 'integer',
					default: 0
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
					title: 'user',
					const: 'user'
				},
				id: {
					title: 'id',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

Pageboard.elements.settings = {
	priority: -10,
	properties: {
		consents: {
			title: 'User Consents',
			type: 'object',
			properties: {
				mandatory: {
					title: 'Mandatory Contacts',
					type: 'boolean',
					default: false
				},
				extra: {
					title: 'Extra Contacts',
					type: 'boolean',
					default: false
				}
			}
		},
		grants: {
			title: 'Grants',
			type: 'array',
			uniqueItems: true,
			items: {
				anyOf: [{
					const: 'root',
					title: 'Root',
					description: 'anything'
				}, {
					const: 'owner',
					title: 'Owner',
					description: 'site owner'
				}, {
					const: 'webmaster',
					title: 'Webmaster',
					description: 'site developer'
				}, {
					const: 'writer',
					title: 'Writer',
					description: 'content editor'
				}, {
					const: 'user',
					title: 'User',
					description: 'public user'
				}, {
					type: 'string',
					format: 'id',
					title: 'Custom',
					description: 'custom grant'
				}]
			}
		}
	},
	parents: {
		type: 'array',
		items: [{
			type: 'object',
			properties: {
				type: {
					title: 'user',
					const: 'user'
				},
				id: {
					title: 'id',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

