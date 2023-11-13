Pageboard.schemaFilters.action = function ActionFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [];
	const blocks = Pageboard.editor.blocks.find([opts.action == "write" ? "api_form" : "fetch"]);
	for (const block of blocks) {
		const { method, parameters = {} } = block.data?.action || {};
		if (!method) continue;
		const service = Pageboard.service(method);

		if (!service || service.$action != opts.action) continue;
		const { type } = parameters;
		const typeSchema = Pageboard.editor.element(type);
		schema.anyOf.push({
			const: block.id,
			title: service.title + (typeSchema ? `: ${typeSchema.title}` : '')
		});
	}
	if (schema.anyOf.length == 0) {
		schema.anyOf.push({
			title: "None",
			const: null
		});
	}
};
