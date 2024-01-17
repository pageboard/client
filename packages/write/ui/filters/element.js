Pageboard.schemaFilters.element = class ElementFilter {
	constructor(key, opts) {
		this.key = key;
		this.opts = opts;
	}
	update(block, schema) {
		const list = [];
		schema = { ...schema };
		if (this.opts.multiple) {
			schema.type = 'array';
			schema.items = { anyOf: list };
		} else {
			delete schema.items;
			delete schema.type;
			list.push({
				const: null,
				title: 'none'
			});
			schema.anyOf = list;
		}
		for (const el of Object.values(Pageboard.editor.elements)) {
			if (el.standalone && !el.virtual) list.push({
				const: el.name,
				title: el.title
			});
		}
		return schema;
	}
};

