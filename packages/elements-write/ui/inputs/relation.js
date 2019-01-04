(function(Pageboard) {
Pageboard.schemaFilters.relation = RelationFilter;

function RelationFilter(key, opts, schema) {
	this.key = key;
	this.schema = schema;
	this.opts = opts;
}

RelationFilter.prototype.init = function(block) {
	var type = block.data;
	var path = this.key.split('.');
	path.splice(-1, 1, 'type');
	path.forEach(function(name) {
		type = type[name] || {};
	});
	if (!type) return;
	var el = Pageboard.editor.elements[type];
	var parents = el && el.parents;
	if (!parents) return;
	this.items = this.schema.items;
	Object.assign(this.schema, parents);
};

RelationFilter.prototype.destroy = function() {
	this.schema.items = this.items;
};

})(window.Pageboard);
