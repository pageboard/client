exports.dictionary = {
	title: 'Dictionary',
	standalone: true,
	bundle: true,
	properties: {
		languages: {
			title: 'Languages',
			type: 'array',
			items: {
				type: 'string'
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
		translations: {
			title: 'Translations',
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
