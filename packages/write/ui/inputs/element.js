Pageboard.schemaFilters.element = function ElementFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [{
		const: null,
		title: 'none'
	}];
	for (const el of Object.values(Pageboard.editor.elements)) {
		if (el.standalone && !el.virtual) schema.anyOf.push({
			const: el.name,
			title: el.title
		});
	}
};

