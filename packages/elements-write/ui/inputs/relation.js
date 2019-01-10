(function(Pageboard) {
Pageboard.schemaFilters.relation = RelationFilter;

function RelationFilter(key, opts) {
	this.key = key;
	this.opts = opts;
}

RelationFilter.prototype.update = function(block, schema) {
	var type, el;
	var path = this.key.split('.');
	if (this.opts.from == "service") {
		path.splice(-2, 2, 'method');
		type = path.reduce(function(obj, name) {
			return obj[name] || null;
		}, block.data);
		if (!type) return;
		var parts = type.split('.');
		if (parts.length == 2) {
			el = (Pageboard.services[parts[0]] || {})[parts[1]] || {};
		}
	} else {
		path.splice(-1, 1, 'type');
		type = path.reduce(function(obj, name) {
			return obj[name] || null;
		}, block.data);
		if (!type) return;
		el = Pageboard.editor.elements[type];
	}
	var parents = el && el.parents;
	if (!parents) return;
	return Object.assign({}, schema, parents);
};

})(window.Pageboard);
