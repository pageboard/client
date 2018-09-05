(function(Pageboard) {
Pageboard.schemaHelpers.element = Element;

function Element(input, opts, props) {
	delete props.type;
	props.anyOf = [{type: 'null', title: 'none'}];
	Object.values(Pageboard.editor.elements).forEach(function(el) {
		if (opts.standalone && !el.standalone) return;
		if (el.title) props.anyOf.push({
			const: el.name,
			title: el.title
		});
	});
}

})(window.Pageboard);
