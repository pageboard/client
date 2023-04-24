exports.dictionary = {
	title: 'Dictionary',
	standalone: true,
	bundle: true,
	required: ['source'],
	properties: {
		title: {
			title: 'Title',
			type: 'string',
			nullable: true
		},
		source: {
			title: 'Language',
			anyOf: [{
				const: 'fr',
				title: 'French'
			}, {
				const: 'en',
				title: 'English'
			}, {
				const: 'it',
				title: 'Italian'
			}]
		},
		targets: {
			title: 'Target languages',
			type: 'array'
		}
	}
};
exports.dictionary.properties.targets.items = exports.dictionary.properties.source;

exports.site.properties.dictionary =
exports.page.properties.dictionary = {
	title: 'Dictionary',
	type: 'string',
	format: 'id',
	nullable: true
};

exports.translation = {
	title: 'Translation unit',
	bundle: 'dictionary',
	standalone: true,
	required: ['type', 'content', 'source'],
	contents: true,
	properties: {
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
		verified: {
			title: 'Verified translations',
			type: 'object',
			additionalProperties: {
				type: 'boolean'
			},
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
