Pageboard.schemaFilters.intl = function IntlFilter(key, opts, schema) {
	delete schema.type;
	delete schema.format;
	schema.anyOf = [];
	const intlName = new Intl.DisplayNames([document.documentElement.lang], {
		type: opts.of
	});
	for (const tz of Intl.supportedValuesOf(opts.of)) {
		schema.anyOf.push({
			const: tz,
			title: intlName.of(tz)
		});
	}
};
