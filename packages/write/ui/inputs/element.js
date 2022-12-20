Pageboard.schemaFilters.element = function ElementFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [{
		const: null,
		title: 'none'
	}];
	for (const el of Pageboard.standalones) {
		schema.anyOf.push({
			const: el.name,
			title: el.title
		});
	}
};

