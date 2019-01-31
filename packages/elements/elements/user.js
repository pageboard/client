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
					$level: 1,
					title: 'Root',
					description: 'anything'
				}, {
					const: 'owner',
					$level: 10,
					title: 'Owner',
					description: 'site owner'
				}, {
					const: 'webmaster',
					$level: 100,
					title: 'Webmaster',
					description: 'site developer'
				}, {
					const: 'writer',
					$level: 1000,
					title: 'Writer',
					description: 'content editor'
				}, {
					const: 'user',
					$level: 10000,
					title: 'User',
					description: 'public user'
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

