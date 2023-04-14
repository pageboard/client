exports.dictionary = {
	title: 'Dictionary',
	standalone: true,
	bundle: true,
	required: ['source'],
	properties: {
		source: {
			title: 'Source language',
			description: 'Language tag syntax',
			type: 'string',
			pattern: /^([a-zA-Z]+-?)+$/.source
		},
		targets: {
			title: 'Target languages',
			description: 'Language tag syntax',
			type: 'array',
			items: {
				type: 'string',
				pattern: /^([a-zA-Z]+-?)+$/.source
			}
		}
	}
};

exports.translation = {
	title: 'Translation unit',
	bundle: 'dictionary',
	standalone: true,
	required: ['type', 'content', 'source'],
	properties: {
		verified: {
			title: 'Verified',
			type: 'boolean',
			default: false
		},
		type: {
			title: 'Block type',
			type: 'string',
			format: 'name',
			$filter: 'element'
		},
		content: {
			title: 'Content name',
			type: 'string',
			format: 'name'
		},
		source: {
			title: 'Source text',
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
