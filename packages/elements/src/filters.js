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

exports.checked = function(val, what, selector) {
	var ret = what.filters.attr(val === true ? 'checked' : null, what, 'checked', selector);
	if (val !== true) delete what.attr;
	return ret;
};

exports.sum = function(obj, what, ...list) {
	var sum = 0;
	if (obj == null) return sum;
	list.forEach(function(str) {
		var sign = 1;
		if (str.startsWith('-')) {
			sign = -1;
			str = str.substring(1);
		}
		var curVal = what.expr.get(obj, str);
		if (curVal != null && typeof curVal == "number") sum += sign * curVal;
	});
	return sum;
};

exports.query = function(val, what, name) {
	var q = Object.assign({}, what.scope.$query);
	for (var key in q) if (key[0] == "_") delete q[key];
	q[name] = val;
	return Page.format({pathname: "", query: q});
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
	var scopeData = what.scope.data;
	if (scopeData.$element) {
		schemaPath = rel.join('.properties.');
		schemaRoot = scopeData.$element.properties;
	} else if (scopeData.$elements) {
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
		schemaPath = '$elements.' + item.block.type + '.properties.'
			+ rel.slice(item.index).join('.properties.');
		schemaRoot = scopeData.$elements;
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
