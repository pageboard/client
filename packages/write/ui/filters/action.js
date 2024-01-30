Pageboard.schemaFilters.action = function ActionFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [];
	const blocks = Pageboard.editor.blocks.find([opts.action == "write" ? "api_form" : "fetch"]);
	for (const block of blocks) {
		if (!block.data.name) continue;
		const { method } = block.data?.action || {};
		if (!method) continue;
		const service = Pageboard.schemas.services.definitions[method];

		if (!service || service.$action != opts.action) continue;
		schema.anyOf.push({
			const: block.data.name,
			title: block.data.name
		});
	}
};
