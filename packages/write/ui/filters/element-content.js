Pageboard.schemaFilters['element-content'] = class ElementContentFilter {
	#key;
	constructor(key, opts, schema, parentSchema) {
		this.#key = key;
		this.schema = schema;
	}
	update(block, schema) {
		if (!this.schema.anyOf) {
			console.error("Cannot adapt schema to element-content:", schema);
			return;
		}
		const prop = { ...this.schema };
		prop.anyOf = this.schema.anyOf.filter(item => item.const !== undefined);
		const path = this.#key.split('.');
		path.splice(-1, 1, 'type');
		const type = path.reduce((obj, name) => obj?.[name], block.data);
		if (type) {
			const el = Pageboard.editor.element(type);
			if (el) {
				const contents = el.contents?.list.map(item => ({
					title: item.title,
					"const": item.id
				}));
				prop.anyOf.push(...contents);
			}
		}
		return prop;
	}
};
