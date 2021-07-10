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
			type = path.reduce(function (obj, name) {
				return obj[name] || null;
			}, block.data);
			if (!type) return;
			const parts = type.split('.');
			if (parts.length == 2) {
				el = (Pageboard.services[parts[0]] || {})[parts[1]] || {};
			}
		} else {
			path.splice(-1, 1, 'type');
			type = path.reduce(function (obj, name) {
				return obj && obj[name] || null;
			}, block.data);
			if (!type) return;
			el = Pageboard.editor.elements[type];
		}
		const parents = el && el.parents || { type: "null" };
		return Object.assign({}, schema, parents);
	}
};
