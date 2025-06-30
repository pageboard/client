Pageboard.schemaFilters.relation = class RelationFilter {

	constructor(key, opts) {
		this.key = key;
		this.opts = opts;
	}

	update(block, schema) {
		let type, el;
		const path = this.key.split('.');
		if (this.opts.from == "service") {
			path.splice(-2, 2, 'method');
			type = path.reduce((obj, name) => obj[name] || null, block.data);
			if (!type) return;
			el = Pageboard.services.definitions[type] || {};
		} else {
			path.splice(-1, 1, 'type');
			type = path.reduce((obj, name) => obj?.[name], block.data);
			if (!type) return;
			el = Pageboard.editor.element(type);
		}
		const nullable = schema.nullable || (schema.anyOf || schema.oneOf || []).some(obj => obj.type == "null");
		const rschema = { nullable };
		if (!el?.parents) return rschema;
		Object.assign(rschema, el.parents);
		if (!rschema.title) rschema.title = schema.title;
		return rschema;
	}
};
