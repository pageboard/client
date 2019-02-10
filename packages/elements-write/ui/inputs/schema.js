(function(Pageboard) {
Pageboard.schemaFilters.schema = SchemaFilter;
/*
$filter: {
	name: 'schema',
	from: 'settings.properties.grants.items.anyOf'
	to: 'anyOf'
}
will replace current schema with the one given in path
*/
function SchemaFilter(key, opts) {
	this.key = key;
	this.opts = opts;
}

SchemaFilter.prototype.update = function(block, schema) {
	if (!this.opts.from) {
		console.warn("$filter schema is missing path option");
		return;
	}
	var schemaPath = this.opts.from.split('.');
	var otherSchema = schemaPath.reduce(function(obj, name) {
		return obj[name] || null;
	}, Pageboard.editor.elements[schemaPath.shift()]);
	if (!otherSchema) {
		console.warn('$filter schema does not find', this.opts.from);
		return;
	}
	if (this.opts.to) {
		schema[this.opts.to] = otherSchema;
	} else {
		return Object.assign({}, otherSchema);
	}
};

})(window.Pageboard);
