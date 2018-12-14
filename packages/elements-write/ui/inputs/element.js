(function(Pageboard) {
Pageboard.schemaFilters.element = ElementFilter;

function ElementFilter(key, opts, schema) {
	delete schema.type;
	schema.anyOf = [{type: 'null', title: 'none'}];
	Object.values(Pageboard.editor.elements).forEach(function(el) {
		if (opts.standalone && !el.standalone || el.inplace || !el.title) return;
		schema.anyOf.push({
			const: el.name,
			title: el.title
		});
	});
}

})(window.Pageboard);
