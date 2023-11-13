Pageboard.schemaFilters.schema = class SchemaFilter {
	/*
	$filter: {
		name: 'schema',
		path: 'settings.properties.grants.items'
	}
	will replace current schema with the one given in path
	*/
	constructor(key, opts) {
		this.key = key;
		this.opts = opts;
	}

	update(block, schema) {
		if (!this.opts.path) {
			console.warn("$filter schema is missing path option");
			return;
		}
		const schemaPath = this.opts.path.split('.');
		const otherSchema = schemaPath.reduce(
			(obj, name) => obj[name] || null,
			Pageboard.elements[schemaPath.shift()]
		);
		if (!otherSchema) {
			console.warn('$filter schema does not find', this.opts.path);
			return;
		}
		const copy = {
			title: schema.title,
			description: schema.description,
			nullable: schema.nullable
		};

		return { ...otherSchema, ...copy };
	}
};
