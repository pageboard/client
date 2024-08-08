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
		if (!el?.parents) return {};
		if (!el.parents.title) el.parents.title = schema.title;
		return el.parents;
	}
};
