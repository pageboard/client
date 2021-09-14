export function alias(val, what, name) {
	if (!name) return val;
	const list = name.split('.');
	const obj = {};
	let cur = obj;
	list.forEach((item, i) => {
		if (i == list.length - 1) cur[item] = val;
		else cur = cur[item] = {};
	});
	return obj;
}

export function polyfills($elements, what) {
	const map = {};
	for (const key of $elements) {
		let list = $elements[key].polyfills;
		if (!list) return;
		if (typeof list == "string") list = [list];
		for (const item of list) {
			// what.scope from matchdom is not like scope from pageboard
			map[item.fuse({}, what.scope.data)] = true;
		}
	}
	return Object.keys(map).join(',');
}

export function csp($elements, what) {
	const csp = {};
	for (const key of $elements) {
		const el = $elements[key];
		if (el.scripts) for (const src of el.scripts) {
			const origin = /(^https?:\/\/[.-\w]+)/.exec(src);
			if (origin) {
				if (!el.csp) el.csp = {};
				if (!el.csp.script) el.csp.script;
				el.csp.script.push(origin[0]);
			}
		}
		if (el.stylesheets) for (const src of el.stylesheets) {
			const origin = /(^https?:\/\/[.-\w]+)/.exec(src);
			if (origin) {
				if (!el.csp) el.csp = {};
				if (!el.csp.style) el.csp.style;
				el.csp.style.push(origin[0]);
			}
		}
		if (!el.csp) continue;
		for (const src of Object.keys(el.csp)) {
			let gcsp = csp[src];
			if (!gcsp) csp[src] = gcsp = [];
			let list = el.csp[src];
			if (!list) continue;
			if (typeof list == "string") list = [list];
			for (const item of list) {
				if (gcsp.includes(item) == false) gcsp.push(item);
			}
		}
	}
	return Object.keys(csp)
		.filter((src) => csp[src].length > 0)
		.map((src) => {
			const key = src.indexOf('-') > 0 ? src : `${src}-src`;
			return `${key} ${csp[src].join(' ')}`.trim().fuse({}, what.scope.data);
		}).join('; ');
}


export function id(id, what) {
	if (id) return id;
	id = what.scope.data.$id;
	if (!id) return id;
	return 'x' + id.slice(0, 4);
}


const numMap = {
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
export function num(val, what, str) {
	if (!val) return '';
	return what.filters.post(numMap[val] || '', what, str);
}

export function checked(val, what, selector) {
	const ret = what.filters.attr(val === true ? 'checked' : null, what, 'checked', selector);
	if (val !== true) delete what.attr;
	return ret;
}

export function includes(val, what, str) {
	if (Array.isArray(val)) return val.includes(str);
	else if (typeof val == "string") return val == str;
}

export function sum(obj, what, ...list) {
	let sum = 0;
	if (obj == null) return sum;
	for (let str of list) {
		let sign = 1;
		if (str.startsWith('-')) {
			sign = -1;
			str = str.substring(1);
		}
		let val = what.expr.get(obj, str);
		if (val == null) continue;
		if (typeof val == "string") val = parseFloat(val);
		if (Number.isNaN(val)) continue;
		sum += sign * val;
	}
	return sum;
}

export function schema(val, what, spath) {
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
			const prop = listOf.find((item) => {
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
}

export function autolink(val, what) {
	const hrefs = what.scope.data.$hrefs;
	const a = what.parent;
	const loc = Page.parse(val);
	if (loc.hostname && loc.hostname != document.location.hostname) {
		a.target = "_blank";
		a.rel = "noopener";
	} else if (loc.pathname && (loc.pathname.startsWith('/.') || /\.\w+$/.test(loc.pathname))) {
		a.target = "_blank";
	} else if (val) {
		const href = val.split('?')[0];
		const meta = (hrefs || {})[href];
		if (meta?.mime && meta.mime.startsWith("text/html")) {
			a.target = "_blank";
		}
	}
}

export function unset(obj, what, ...list) {
	if (obj == null || typeof obj != "object") return obj;
	obj = Object.assign({}, obj);
	if (!list.length) list = Object.keys(obj);
	for (const name of list) {
		obj[name] = undefined;
	}
	return obj;
}

export function set(obj, what, name, val) {
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
}

export function enc(str) {
	if (str == null || typeof str != "string") return str;
	return encodeURIComponent(str);
}

export function query(query, what) {
	const str = urltpl({
		pathname: "/",
		query
	}, what).substring(1);
	const nextFilter = what.expr.filters[what.expr.filter];
	if (nextFilter?.name == "enc") {
		if (str?.startsWith('?')) return str.slice(1);
	}
	return str;
}

export function urltpl(obj, what, pName = 'pathname', qName = 'query') {
	const pathname = obj[pName];
	const query = obj[qName];
	if (pathname == null && query == null) return null;
	if (pathname?.fuse()) return pathname;
	const loc = Page.parse(pathname || what.scope.data.$loc.pathname);
	Object.assign(loc.query, query || {});
	const fakes = [];
	for (const [key, val] of Object.entries(loc.query)) {
		if (val === undefined) {
			delete loc.query[key];
		} else if (typeof val == "string" && val.fuse()) {
			delete loc.query[key];
			fakes.push([key, val]);
		}
	}
	let str = loc.toString();
	if (fakes.length) {
		if (Object.keys(loc.query).length == 0) str += '?';
		else str += '&';
		str += fakes.map(([key, val]) => {
			return (val == null ? key : `${key}=${val}`);
		}).join('&');
	}
	return str;
}

export function templates(val, what, prefix) {
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
}

export function isoDate(val, what) {
	const d = parseDate(val);
	if (Number.isNaN(d.getTime())) return null;
	else return d.toISOString();
}

export function parseDate(val) {
	let d;
	if (val instanceof Date) {
		d = val;
	} else {
		if (!val) val = toDate(new Date());
		else if (/^\d\d:\d\d/.test(val)) {
			val = '0 ' + val;
		}
		d = new Date(val);
	}
	return d;
}

export function now(val, what) {
	if (val == null) return Date.now();
	else return val;
}
export function orNow(val, what) {
	return now(val, what);
}


export function toTime(val) {
	if (!val) return val;
	return parseDate(val).toISOString().split('T').pop().split('.').shift();
}

export function toDate(val, what, unit) {
	if (!val) return val;

	let date = parseDate(val).toISOString().split('T');
	const time = date.pop().split('.')[0];
	date = date[0];
	if (!unit) return date;
	const parts = date.split('-');
	if (unit == "year") date = parts[0];
	else if (unit == "month") date = parts[0] + "-" + parts[1];
	else if (unit == "time") date = time;
	else if (unit == "datetime") date += " " + time;
	return date;
}

export function setDate(val, what, amount, unit) {
	const d = parseDate(val);
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
}

export function formatDate(val, what, ...list) {
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
	for (const tok of list) {
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
	}
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
}
