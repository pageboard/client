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

exports.includes = function(val, what, str) {
	if (Array.isArray(val)) return val.includes(str);
	else if (typeof val == "string") return val == str;
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

	var path = what.scope.path;
	var data = (path[0] && path[0].startsWith('$')) ? what.scope.data : what.data;
	var blocks = [];
	for (var i=0; i < path.length; i++) {
		if (!data) break;
		if (data.id && data.type) blocks.push({
			index: i + 1, // add one because path will be block.data and schema is block.data schema
			block: data
		});
		data = data[path[i]];
	}
	var item = blocks.pop();
	if (!item) return;

	var schemaPath = item.block.type + '.properties.'
		+ path.slice(item.index).join('.properties.');

	var schema = what.expr.get(what.scope.data.$elements, schemaPath);
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

exports.statusClass = function(val) {
	val = parseInt(val);
	if (val >= 200 && val < 300) return "success";
	else if (val == 404) return "warning";
	else if (val >= 400) return "error";
};

exports.autolink = function(val, what) {
	var hrefs = what.scope.data.$hrefs;
	var a = what.parent;
	var obj = Page.parse(val);
	if (obj.hostname && obj.hostname != document.location.hostname) {
		a.target = "_blank";
		a.rel = "noopener";
	} else if (obj.pathname && (obj.pathname.startsWith('/.') || /\.\w+$/.test(obj.pathname))) {
		a.target = "_blank";
	} else if (val) {
		var href = val.split('?')[0];
		var meta = (hrefs || {})[href];
		if (meta && meta.mime && meta.mime.startsWith("text/html") == false) {
			a.target = "_blank";
		}
	}
};

exports.query = function(obj, what) {
	if (obj == null || typeof obj != "object") return null;
	var str = Object.keys(obj).map(function(key) {
		var val = obj[key];
		if (val == null) return key;
		else return key + "=" + val;
	}).join('&');
	if (str) return '?' + str;
	else return '';
};
