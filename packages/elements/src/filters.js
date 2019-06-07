exports.id = function(id, what) {
	if (id) return id;
	id = what.scope.data.$id;
	if (!id) return id;
	return 'x' + id.slice(0, 4);
};
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
		var val = what.expr.get(obj, str);
		if (val == null) return;
		if (typeof val == "string") val = parseFloat(val);
		if (isNaN(val)) return;
		sum += sign * val;
	});
	return sum;
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
	else if (val >= 400 || val === 0) return "error";
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

exports.unset = function(obj, what, ...list) {
	if (obj == null || typeof obj != "object") return obj;
	obj = Object.assign({}, obj);
	if (!list.length) list = Object.keys(obj);
	list.forEach(function(name) {
		obj[name] = undefined;
	});
	return obj;
};

exports.set = function(obj, what, name, val) {
	if (obj == null || typeof obj != "object") return obj;
	obj = Object.assign({}, obj);
	obj[name] = val;
	return obj;
};

exports.enc = function(str) {
	if (str == null || typeof str != "string") return str;
	return encodeURIComponent(str);
};

exports.query = function(obj, what) {
	if (obj == null || typeof obj != "object") return null;
	var list = [];
	Object.keys(obj).forEach(function(key) {
		var val = obj[key];
		if (val === undefined) return;
		if (val === null) list.push(key);
		else list.push(key + "=" + val);
	});
	var str = list.join('&');
	if (str) return '?' + str;
	else return '';
};

exports.isoDate = function(val, what) {
	var d = exports.parseDate(val);
	if (isNaN(d.getTime())) return null;
	else return d.toISOString();
};

exports.parseDate = function(val) {
	var d;
	if (val instanceof Date) {
		d = val;
	} else {
		if (!val) val = exports.toDate(new Date());
		else if (/^\d\d:\d\d/.test(val)) {
			val = '0 ' + val;
		}
		d = new Date(val);
	}
	return d;
};

exports.orNow = exports.now = function(val, what) {
	if (val == null) return Date.now();
	else return val;
};

exports.toTime = function(val) {
	if (!val) return val;
	return exports.parseDate(val).toISOString().split('T').pop().split('.').shift();
};

exports.toDate = function(val, what, unit) {
	if (!val) return val;

	var date = exports.parseDate(val).toISOString().split('T');
	var time = date.pop().split('.')[0];
	date = date[0];
	if (!unit) return date;
	var parts = date.split('-');
	if (unit == "year") date = parts[0];
	else if (unit == "month") date = parts[0] + "-" + parts[1];
	else if (unit == "time") date = time;
	else if (unit == "datetime") date += " " + time;
	return date;
};

exports.setDate = function(val, what, amount, unit) {
	var d = exports.parseDate(val);
	amount = parseInt(amount);
	if (!isNaN(amount)) {
		if (!unit) unit = 'day';
		else unit = unit.toLowerCase();
		if (unit.endsWith('s')) unit = unit.slice(0, -1);
		var name = {
			day: 'Date',
			month: 'Month',
			year: 'FullYear',
			hour: 'Hours',
			minute: 'Minutes',
			second: 'Seconds'
		}[unit];
		if (!name) throw new Error("Unknown modDate unit " + unit);
		d[`setUTC${name}`](d[`getUTC${name}`]() + amount);
	}
	return d;
};
