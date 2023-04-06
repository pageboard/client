exports.dictionary = {
	title: 'Dictionary',
	standalone: true,
	bundle: true,
	properties: {
		src: {
			title: 'Source language',
			description: 'ISO 639-3 code',
			type: 'string',
			pattern: /^[a-z]{3}$/.source,
		},
		targets: {
			title: 'Target languages',
			type: 'array',
			items: {
				type: 'string',
				pattern: /^[a-z]{3}$/.source
			}
		}
	}
};

exports.translation = {
	title: 'Translation unit',
	bundle: 'dictionary',
	required: ['src'],
	properties: {
		verified: {
			title: 'Verified',
			type: 'boolean',
			default: false
		},
		src: {
			title: 'Source',
			type: 'string'
		},
		targets: {
			title: 'Targets',
			type: 'object',
			additionalProperties: true,
			default: {}
		}
	},
	parents: {
		type: 'array',
		items: [{
			type: 'object',
			properties: {
				type: {
					title: 'Dictionary',
					const: 'dictionary'
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
