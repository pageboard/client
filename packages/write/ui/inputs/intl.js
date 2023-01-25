Pageboard.schemaFilters.intl = function IntlFilter(key, opts, schema) {
	const list = Intl.supportedValuesOf(opts.of);
	delete schema.type;
	schema.anyOf = [];
	for (const tz of list) {
		schema.anyOf.push({
			const: tz,
			title: tz
		});
	}
};
