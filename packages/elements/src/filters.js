exports.num = function(val, what, str) {
	if (!val) return '';
	return what.filters.post(exports.num.map[val] || '', what, str);
};
exports.num.map = {
	0: '',
	1: 'one',
	2: 'two',
	3: 'three',
	4: 'four',
	5: 'five',
	6: 'six',
	7: 'seven',
	8: 'eight',
	9: 'nine',
	10: 'ten',
	11: 'eleven',
	12: 'twelve',
	13: 'thirteen',
	14: 'fourteen',
	15: 'fifteen',
	16: 'sixteen'
};


exports.schema = function(val, what, spath) {
	// return schema of repeated key, schema of anyOf/listOf const value
	if (val === undefined) return;
	var schemaPath, schemaRoot;
	var path = what.scope.path;
	var rel = path.map(function(item) {
		if (typeof item == "number") return "items";
		else return item;
	});
	if (what.scope.$schemas) {
		var data = what.index != null ? what.scope.data : what.data.data;
		var blocks = [];
		for (var i=0; i < path.length; i++) {
			if (!data) break;
			if (data.id && data.type) blocks.push({index: i, block: data});
			data = data[path[i]];
		}
		var item = blocks.pop();
		if (!item) {
			console.warn("No block found in", what.scope.path);
			return;
		}
		schemaPath = '$schemas.' + item.block.type + '.properties.'
			+ rel.slice(item.index).join('.properties.');
		schemaRoot = what.data;
	} else if (what.scope.$schema) {
		schemaPath = rel.join('.properties.');
		schemaRoot = what.scope.$schema.properties;
	} else {
		console.warn("No schema in scope", what.scope);
	}
	var schema = what.expr.get(schemaRoot, schemaPath);
	if (!schema) {
		console.warn("No schema for", schemaPath);
		return;
	}
	if ((what.scope.iskey === undefined || what.scope.iskey === false) && val !== undefined) {
		var listOf = schema.oneOf || schema.anyOf;
		if (listOf) {
			var prop = listOf.find(function(item) {
				return item.const === val; // null !== undefined
			});
			if (prop != null) schema = prop;
		} else {
			// pointless to return a schema piece when dealing with a value
			spath = null;
		}
	}
	if (spath == null) return val;
	var sval = what.expr.get(schema, spath);
	if (sval === undefined) {
		console.warn("Cannot find path in schema", schema, spath);
		sval = null;
	}
	return sval;
};
