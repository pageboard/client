Pageboard.schemaFilters.block = function BlockFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [];
	if (schema.nullable) schema.anyOf.push({
		const: null,
		title: 'none'
	});
	const blocks = Pageboard.editor.blocks.find(opts.types || []);
	for (const block of blocks) {
		const { method, parameters = {} } = block.data?.action || {};
		if (!method) continue;
		const service = Pageboard.service(method);
		if (!service || service.$action != "read") continue;
		const { type } = parameters;
		const typeSchema = Pageboard.standalones.find(el => el.name == type);
		schema.anyOf.push({
			const: block.id,
			title: service.title + (typeSchema ? `: ${typeSchema.title}` : '')
		});
	}
	if (schema.anyOf.length == 0) {
		Pageboard.notify("Cannot find fetch blocks for types", opts.types);
	}
};