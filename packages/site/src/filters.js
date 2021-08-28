exports.alias = function (val, what, name) {
	if (!name) return val;
	const list = name.split('.');
	const obj = {};
	let cur = obj;
	list.forEach((item, i) => {
		if (i == list.length - 1) cur[item] = val;
		else cur = cur[item] = {};
	});
	return obj;
};

exports.polyfills = function ($elements, what) {
	const map = {};
	Object.keys($elements).forEach(function (key) {
		let list = $elements[key].polyfills;
		if (!list) return;
		if (typeof list == "string") list = [list];
		list.forEach(function (item) {
			// what.scope from matchdom is not like scope from pageboard
			item = item.fuse({}, what.scope.data);
			map[item] = true;
		});
	});
	return Object.keys(map).join(',');
};

exports.csp = function ($elements, what) {
	const csp = {};
	Object.keys($elements).forEach(function (key) {
		const el = $elements[key];
		if (el.scripts) el.scripts.forEach(function (src) {
			const origin = /(^https?:\/\/[.-\w]+)/.exec(src);
			if (origin) {
				if (!el.csp) el.csp = {};
				if (!el.csp.script) el.csp.script;
				el.csp.script.push(origin[0]);
			}
		});
		if (el.stylesheets) el.stylesheets.forEach(function (src) {
			const origin = /(^https?:\/\/[.-\w]+)/.exec(src);
			if (origin) {
				if (!el.csp) el.csp = {};
				if (!el.csp.style) el.csp.style;
				el.csp.style.push(origin[0]);
			}
		});
		if (!el.csp) return;
		Object.keys(el.csp).forEach(function (src) {
			let gcsp = csp[src];
			if (!gcsp) csp[src] = gcsp = [];
			let list = el.csp[src];
			if (!list) return;
			if (typeof list == "string") list = [list];
			list.forEach(function (val) {
				if (gcsp.includes(val) == false) gcsp.push(val);
			});
		});
	});
	return Object.keys(csp).filter(function (src) {
		return csp[src].length > 0;
	}).map(function (src) {
		const key = src.indexOf('-') > 0 ? src : `${src}-src`;
		return `${key} ${csp[src].join(' ')}`.trim().fuse({}, what.scope.data);
	}).join('; ');
};


exports.id = function (id, what) {
	if (id) return id;
	id = what.scope.data.$id;
	if (!id) return id;
	return 'x' + id.slice(0, 4);
};
exports.num = function (val, what, str) {
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

exports.checked = function (val, what, selector) {
	const ret = what.filters.attr(val === true ? 'checked' : null, what, 'checked', selector);
	if (val !== true) delete what.attr;
	return ret;
};

exports.includes = function (val, what, str) {
	if (Array.isArray(val)) return val.includes(str);
	else if (typeof val == "string") return val == str;
};

exports.sum = function (obj, what, ...list) {
	let sum = 0;
	if (obj == null) return sum;
	list.forEach(function (str) {
		let sign = 1;
		if (str.startsWith('-')) {
			sign = -1;
			str = str.substring(1);
		}
		let val = what.expr.get(obj, str);
		if (val == null) return;
		if (typeof val == "string") val = parseFloat(val);
		if (Number.isNaN(val)) return;
		sum += sign * val;
	});
	return sum;
};

exports.schema = function (val, what, spath) {
	// return schema of repeated key, schema of anyOf/listOf const value
	if (val === undefined) return;

	const path = what.scope.path;
	let data = path[0]?.startsWith('$') ? what.scope.data : what.data;
	const blocks = [];
	for (let i = 0; i < path.length; i++) {
		if (!data) break;
		if (data.id && data.type) blocks.push({
			index: i + 1, // add one because path will be block.data and schema is block.data schema
			block: data
		});
		data = data[path[i]];
	}
	const item = blocks.pop();
	if (!item) return;

	const schemaPath = item.block.type + '.properties.'
		+ path.slice(item.index).join('.properties.');

	let schema = what.expr.get(what.scope.data.$elements, schemaPath);
	if (!schema) {
		// eslint-disable-next-line no-console
		console.warn("No schema for", schemaPath);
		return;
	}
	let iskey = spath.endsWith('+');
	if (iskey) {
		spath = spath.slice(0, -1);
	} else {
		iskey = what.scope.iskey !== undefined && what.scope.iskey !== false;
	}
	if (!iskey && val !== undefined) {
		const listOf = schema.oneOf || schema.anyOf;
		if (listOf) {
			const prop = listOf.find(function (item) {
				return item.const === val || item.type === "null" && val === null;
			});
			if (prop != null) schema = prop;
			else return val;
		} else {
			spath = null;
			schema = val;
		}
	}
	let sval = spath ? what.expr.get(schema, spath) : schema;
	if (sval === undefined) {
		// eslint-disable-next-line no-console
		console.warn("Cannot find path in schema", schema, spath);
		sval = null;
	}
	return sval;
};

exports.autolink = function (val, what) {
	const hrefs = what.scope.data.$hrefs;
	const a = what.parent;
	const obj = Page.parse(val);
	if (obj.hostname && obj.hostname != document.location.hostname) {
		a.target = "_blank";
		a.rel = "noopener";
	} else if (obj.pathname && (obj.pathname.startsWith('/.') || /\.\w+$/.test(obj.pathname))) {
		a.target = "_blank";
	} else if (val) {
		const href = val.split('?')[0];
		const meta = (hrefs || {})[href];
		if (!meta?.mime?.startsWith("text/html")) {
			a.target = "_blank";
		}
	}
};

exports.unset = function (obj, what, ...list) {
	if (obj == null || typeof obj != "object") return obj;
	obj = Object.assign({}, obj);
	if (!list.length) list = Object.keys(obj);
	list.forEach(function (name) {
		obj[name] = undefined;
	});
	return obj;
};

exports.set = function (obj, what, name, val) {
	if (obj == null) {
		obj = {};
	}
	if (typeof obj != "object") {
		if (val === undefined) {
			val = obj;
			obj = null;
		} else {
			return obj;
		}
	}
	obj = Object.assign({}, obj);
	obj[name] = val;
	return obj;
};

exports.enc = function (str) {
	if (str == null || typeof str != "string") return str;
	return encodeURIComponent(str);
};

exports.query = function (query, what) {
	const str = exports.urltpl({
		pathname: "/",
		query
	}, what).substring(1);
	const nextFilter = what.expr.filters[what.expr.filter];
	if (nextFilter?.name == "enc") {
		if (str?.startsWith('?')) return str.slice(1);
	}
	return str;
};

exports.urltpl = function (obj, what, pName = 'pathname', qName = 'query') {
	const pathname = obj[pName];
	const query = obj[qName];
	if (pathname == null && query == null) return null;
	if (pathname?.fuse()) return pathname;
	const url = Page.parse(pathname || what.scope.data.$loc.pathname);
	Object.assign(url.query, query || {});
	const fakes = [];
	Object.entries(url.query).forEach(([key, val]) => {
		if (val === undefined) {
			delete url.query[key];
		} else if (typeof val == "string" && val.fuse()) {
			delete url.query[key];
			fakes.push([key, val]);
		}
	});
	let str = Page.format(url);
	if (fakes.length) {
		if (Object.keys(url.query).length == 0) str += '?';
		else str += '&';
		str += fakes.map(([key, val]) => {
			return (val == null ? key : `${key}=${val}`);
		}).join('&');
	}
	return str;
};

exports.templates = function (val, what, prefix) {
	if (!val) return val;
	const obj = {};
	JSON.stringify(val).fuse({ [prefix]: {} }, {
		$filters: {
			'||'(val, what) {
				if (what.expr.path[0] != prefix) return val;
				const key = what.expr.path.slice(1).map(
					k => k.replace(/\\./g, '%5C')
				).join('.');
				const expr = what.expr.toString();
				if (obj[key] !== undefined && obj[key] !== expr) {
					// eslint-disable-next-line no-console
					console.error(`templates:${prefix} has incompatible values (${obj[key]} != ${expr})`);
				} else {
					obj[key] = expr;
				}
			}
		}
	});
	return Object.keys(obj).map(key => obj[key]).join(' ') || null;
};

exports.isoDate = function (val, what) {
	const d = exports.parseDate(val);
	if (Number.isNaN(d.getTime())) return null;
	else return d.toISOString();
};

exports.parseDate = function (val) {
	let d;
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

exports.orNow = exports.now = function (val, what) {
	if (val == null) return Date.now();
	else return val;
};

exports.toTime = function (val) {
	if (!val) return val;
	return exports.parseDate(val).toISOString().split('T').pop().split('.').shift();
};

exports.toDate = function (val, what, unit) {
	if (!val) return val;

	let date = exports.parseDate(val).toISOString().split('T');
	const time = date.pop().split('.')[0];
	date = date[0];
	if (!unit) return date;
	const parts = date.split('-');
	if (unit == "year") date = parts[0];
	else if (unit == "month") date = parts[0] + "-" + parts[1];
	else if (unit == "time") date = time;
	else if (unit == "datetime") date += " " + time;
	return date;
};

exports.setDate = function (val, what, amount, unit) {
	const d = exports.parseDate(val);
	amount = parseInt(amount);
	if (!Number.isNaN(amount)) {
		if (!unit) unit = 'day';
		else unit = unit.toLowerCase();
		if (unit.endsWith('s')) unit = unit.slice(0, -1);
		const name = {
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

exports.formatDate = function (val, what, ...list) {
	if (/^\d\d:\d\d(:\d\d)?$/.test(val)) {
		val = '1970-01-01T' + val + 'Z';
	}
	const d = new Date(val);
	const p = {};
	const n = 'narrow';
	const s = 'short';
	const l = 'long';
	const num = 'numeric';
	const dig = '2-digit';
	list.forEach(function (tok) {
		switch (tok) {
			case 'd': p.weekday = n; break;
			case 'da': p.weekday = s; break;
			case 'day': p.weekday = l; break;
			case 'Y': p.year = num; break;
			case 'YY': p.year = dig; break;
			case 'mo': p.month = n; break;
			case 'mon': p.month = s; break;
			case 'month': p.month = l; break;
			case 'M': p.month = num; break;
			case 'MM': p.month = dig; break;
			case 'D': p.day = num; break;
			case 'DD': p.day = dig; break;
			case 'H': p.hour = num; break;
			case 'HH': p.hour = dig; break;
			case 'm': p.minute = num; break;
			case 'mm': p.minute = dig; break;
			case 's': p.second = num; break;
			case 'ss': p.second = dig; break;
			case 'tz': p.timeZoneName = s; break;
			case 'timezone': p.timeZoneName = l; break;
			default:
				if (/\w+\/\w+/.test(tok)) p.timeZone = tok;
				// eslint-disable-next-line no-console
				else console.warn("Unrecognized date format option", tok);
				break;
		}
	});
	const lang = document.documentElement.lang || 'en';
	let str;
	try {
		str = d.toLocaleString(lang, p);
	} catch (err) {
		if (p.timeZone && p.timeZone != "UTC") {
			p.timeZone = "UTC";
			str = d.toLocaleString(lang, p) + " UTC";
		} else {
			throw err;
		}
	}
	return str;
};
