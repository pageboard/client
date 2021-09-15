Pageboard.schemaFilters.element = function ElementFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [{type: 'null', title: 'none'}];
	for (const el of Object.values(Pageboard.editor.elements)) {
		if (!el.title || el.inplace) continue;
		if (opts.contentless && !el.dom) {
			// keep it
		} else if (opts.standalone && el.standalone) {
			// keep it
		} else {
			continue;
		}
		schema.anyOf.push({
			const: el.name,
			title: el.title
		});
	}
};

