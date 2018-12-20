Pageboard.elements.user = {
	required: ['email'],
	$locks: [],
	properties: {
		email: {
			type: 'string',
			format: 'email',
			transform: ['trim', 'toLowerCase']
		}
	}
};

Pageboard.elements.priv = {
	$locks: [],
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
	}
};

Pageboard.elements.settings = {
	properties: {
		grants: {
			type: 'array',
			uniqueItems: true,
			items: {
				anyOf: [{
					const: 'root',
					title: 'Root',
					description: 'Allowed to do anything'
				}, {
					const: 'owner',
					title: 'Owner',
					description: 'Allowed to modify site'
				}, {
					const: 'webmaster',
					title: 'Webmaster',
					description: 'Allowed to modify pages'
				}, {
					const: 'writer',
					title: 'Writer',
					description: 'Allowed to modify some public blocks'
				}, {
					const: 'user',
					title: 'User',
					description: 'Allowed to modify some private blocks'
				}]
			}
		}
	}
};

