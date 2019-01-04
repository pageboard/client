Pageboard.schemaFilters.element = function ElementFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [{type: 'null', title: 'none'}];
	Object.values(Pageboard.editor.elements).forEach(function(el) {
		if (!el.title || el.inplace) return;
		if (opts.contentless && !el.dom) {
			// keep it
		} else if (opts.standalone && el.standalone) {
			// keep it
		} else {
			return;
		}
		schema.anyOf.push({
			const: el.name,
			title: el.title
		});
	});
};

