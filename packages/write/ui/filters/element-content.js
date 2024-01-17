Pageboard.schemaFilters['element-content'] = class ElementContentFilter {
	#key;
	#which;
	constructor(key, opts, schema) {
		this.schema = Object.assign({}, schema);
		const which = ['anyOf', 'oneOf'].find(key => Boolean(schema[key]));
		const alts = schema[which];
		if (!alts) {
			console.error("Cannot adapt schema to element-content:", schema);
			return;
		}
		this.schema[which] = alts.filter(item => item.const !== undefined);
		this.#which = which;
		this.#key = key;
	}
	update(block) {
		const schema = { ...this.schema };
		schema[this.#which] = schema[this.#which].slice();
		const path = this.#key.split('.');
		path.splice(-1, 1, 'type');
		let type = path.reduce((obj, name) => obj?.[name], block.data);
		if (!type) return schema;
		if (typeof type == "string") type = [type];
		if (type.length == 1) {
			const el = Pageboard.editor.element(type[0]);
			if (el) {
				const contents = el.contents?.list.map(item => ({
					title: item.title,
					"const": item.id
				}));
				schema[this.#which].push(...contents);
			} else {
				console.warn("element type not found", type);
			}
		}
		return schema;
	}
};
