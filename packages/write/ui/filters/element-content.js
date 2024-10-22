Pageboard.schemaFilters['element-content'] = class ElementContentFilter {
	#key;
	constructor(key, opts, schema) {
		this.schema = Object.assign({}, schema);
		if (!schema.items) {
			console.error("element-content filter expects type array and items:", schema);
			return;
		}
		this.#key = key;
	}
	update(block) {
		const schema = { ...this.schema };
		if (!schema.items) return;
		schema.items = { ...schema.items, anyOf: [] };
		const path = this.#key.split('.');
		path.splice(-1, 1, 'type');
		let type = path.reduce((obj, name) => obj?.[name], block.data);
		if (!type) {
			schema.$disabled = true;
		} else if (typeof type == "string") {
			type = [type];
		}
		if (type?.length == 1) {
			const el = Pageboard.editor.element(type[0]);
			if (el) {
				const contents = el.contents?.list.map(item => ({
					title: item.title ?? item.id,
					"const": item.id
				}));
				schema.items.anyOf.push(...contents);
				schema.$disabled = !contents.length;
				delete schema.items.type;
				delete schema.items.format;
			} else {
				schema.$disabled = true;
			}
		} else {
			schema.$disabled = true;
		}
		return schema;
	}
};
