Pageboard.schemaFilters['element-value'] = class ElementValueFilter {
	#using;

	constructor(key, opts) {
		this.#using = opts.using;
	}

	update(block, schema) {
		// TODO instead of requiring a schema from type,
		// infer a schema from current form inputs
		const empty = {
			title: schema.title,
			$filter: schema.$filter,
			type: "null"
		};
		const usingPath = this.#using.split('.');
		const key = usingPath.reduce((obj, name) => obj?.[name], block.data);
		if (!key) return empty;
		const path = key.split('.');

		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error(
			`Cannot create input, DOM node not found for block ${block.id}`
		);
		const prefix = dom.closest('[block-type="fieldset_list"]')?.prefix?.slice() ?? [];
		while (prefix.length) if (path[0] == prefix.shift()) path.shift();

		const formId = dom.closest('form')?.getAttribute('block-id');
		const formBlock = Pageboard.editor.blocks.get(formId);
		if (!formBlock) {
			console.warn("Cannot update element-value", block);
			return;
		}
		try {
			const el = Pageboard.schemaHelpers['element-property'].buildSchema(formBlock);
			const prop = path.reduce((obj, name) => {
				if (!obj) return;
				if (obj.type == "array" && obj.items && !Array.isArray(obj.items)) {
					obj = obj.items;
				}
				return obj?.properties?.[name];
			}, el);
			if (!prop) return empty;
			delete empty.type;
			return { ...prop, ...empty };
		} catch (err) {
			console.warn("Cannot update element-value", formBlock, err);
		}
	}
};
