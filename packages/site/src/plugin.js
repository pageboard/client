export const formats = {
	as: { polyfills, csp, xid, colnums, block, binding, query },
	date: { utc }
};

export const filters = {
	sum,
	schema: ['?', 'path?', 'path?', schemaFn],
	content: ['block', 'str', contentFn],
	urltpl, templates
};

export const hooks = {
	beforeEach(ctx, val, filter) {
		if (filter[0] == "get" && filter[1]?.startsWith('$')) {
			if (ctx.$data == null) {
				ctx.$data = ctx.data;
				ctx.data = ctx.scope;
			}
		} else if (ctx.$data != null) {
			ctx.data = ctx.$data;
			ctx.$data = null;
		}
		return val;
	}
};

function binding(ctx, str) {
	if (!str || typeof str != "string") return str;
	return `[${str.trim().split('\n').join('|')}]`;
}

function block(ctx, obj) {
	if (!obj) return;
	if (typeof obj == "object" && obj.type && obj.id) return obj;
	else return;
}

function utc(ctx, val) {
	if (!val) return val;
	return val.toUTCString();
}

function polyfills(ctx, $elements) {
	const map = {};
	for (const el of Object.values($elements)) {
		let list = el.polyfills;
		if (!list) continue;
		if (typeof list == "string") list = [list];
		for (const item of list) {
			// what.scope from matchdom is not like scope from pageboard
			map[item.fuse({}, ctx.scope)] = true;
		}
	}
	return Object.keys(map).join(',');
}

function csp(ctx, $elements) {
	const csp = {};
	for (const el of Object.values($elements)) {
		if (el.scripts) for (const src of el.scripts) {
			const origin = /(^https?:\/\/[.-\w]+)/.exec(src);
			if (origin) {
				if (!el.csp) el.csp = {};
				if (!el.csp.script) el.csp.script = [];
				el.csp.script.push(origin[0]);
			}
		}
		if (el.stylesheets) for (const src of el.stylesheets) {
			const origin = /(^https?:\/\/[.-\w]+)/.exec(src);
			if (origin) {
				if (!el.csp) el.csp = {};
				if (!el.csp.style) el.csp.style = [];
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
	const list = Object.keys(csp)
		.filter(src => csp[src].length > 0)
		.map(src => {
			const key = src.indexOf('-') > 0 ? src : `${src}-src`;
			return `${key} ${csp[src].join(' ')}`.trim().fuse({}, ctx.scope);
		});
	return list.join('; ');
}


function xid(ctx, id) {
	if (id) return id;
	id = ctx.scope.$id;
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

function colnums(ctx, val) {
	if (!val) return '';
	return numMap[val] || '';
}

function sum(ctx, obj, ...list) {
	let sum = 0;
	if (obj == null) return sum;
	for (let str of list) {
		let sign = 1;
		if (str.startsWith('-')) {
			sign = -1;
			str = str.substring(1);
		}
		let val = ctx.expr.get(obj, str);
		if (val == null) continue;
		if (typeof val == "string") val = parseFloat(val);
		if (Number.isNaN(val)) continue;
		sum += sign * val;
	}
	return sum;
}

function schemaFn(ctx, val, schemaPath, pathToSchema) {
	// return schema of repeated key, schema of anyOf/listOf const value
	if (val === undefined) return;
	let isIndex = false;
	if (pathToSchema.length == 0) {
		// read current path until we find a block
		const path = ctx.expr.path;
		let data = ctx.data;
		let item;
		for (let i = 0; i < path.length; i++) {
			if (!data) break;
			if (data.id && data.type) item = {
				index: i + 1, // add one because path will be block.data and schema is block.data schema
				block: data
			};
			else if (data.$id && data.$type) item = {
				index: i + 1,
				block: {
					id: data.$id,
					type: data.$type,
					data
				}
			};
			data = data[path[i]];
		}
		if (!item) return val;
		isIndex = !Number.isNaN(parseInt(path[path.length - 1]));
		pathToSchema = [
			item.block.type,
			...path.slice(item.index, isIndex ? -1 : null)
		];
	}

	let schema = ctx.expr.get(
		ctx.scope.$elements,
		pathToSchema.join('.properties.').split('.')
	);
	if (!schema) {
		// eslint-disable-next-line no-console
		console.warn("No schema for", pathToSchema);
		return;
	}
	if (schema.type == "array") {
		schema = schema.items;
	} else if (isIndex) {
		console.warn("Expected schema type: array", pathToSchema);
		return;
	}

	if (val !== undefined) {
		const listOf = schema.oneOf || schema.anyOf;
		if (listOf) {
			const prop = listOf.find(item => {
				return item.const === val || item.type === "null" && val === null;
			});
			if (prop != null) schema = prop;
			else return val;
		} else {
			schemaPath = [];
			schema = val;
		}
	}
	let sval = ctx.expr.get(schema, schemaPath);
	if (sval === undefined) {
		// eslint-disable-next-line no-console
		console.warn("Cannot find path in schema", schema, schemaPath);
		sval = null;
	}
	return sval;
}

function query(ctx, query) {
	const str = urltpl(ctx, {
		pathname: "/",
		query
	}).substring(1);
	const nextFilter = ctx.expr.filters[ctx.expr.filter];
	if (nextFilter?.name == "enc") {
		if (str?.startsWith('?')) return str.slice(1);
	}
	return str;
}

function urltpl(ctx, obj, pName = 'pathname', qName = 'query') {
	const pathname = obj[pName];
	const query = obj[qName];
	if (pathname == null && query == null) return null;
	if (pathname?.fuse()) return pathname;
	const loc = Page.parse(pathname || ctx.scope.$loc.pathname);
	if (query) {
		// flatten and assign
		Object.assign(loc.query, Page.parse(Page.format({ query })).query);
		// N.B:
		// "/path?type=[$query.type]".fuse({$query: {type: ["a", "b"]}}) -> "/path?type=a,b"
		// this is wrong, it should be "/path?type=a&type=b"
		// maybe "/path?type=[$query.type|enc:url]"
	}
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

function templates(ctx, val, ...prefixes) {
	if (!val) return null;
	const obj = {};
	const scope = {};
	scope.$hooks = {
		afterAll(ctx, val) {
			const { path } = ctx.expr;
			if (prefixes.includes(path[0]) == false) {
				// ignore those
				return val;
			}
			// templatesQuery checks flattened query
			const key = path.length > 1 ? path.slice(1).join('%2E') : path[0];
			const short = path.length > 1 ? `${path[0]}.${key}` : path[0];

			const optional = val !== undefined && ctx.expr.get(scope, path) === undefined;
			const prev = obj[key] ?? (obj[key] = short);
			if (optional && !prev.endsWith('?')) obj[key] += '?';

			return val;
		}
	};
	for (const prefix of prefixes) scope[prefix] = {};
	JSON.stringify(val).fuse({}, scope);
	return (
		typeof val == "string" ? Object.keys(obj) : Object.values(obj)
	).join(' ') || null;
}

function contentFn(ctx, block, name) {
	const { scope } = ctx;

	const el = {
		name: block.type, // can't we just use block.type ? no risk to overwrite ?
		contents: scope.$elements[block.type].contents,
		html: `<div block-content="${name}"></div>`
	};

	const dom = scope.render({ item: block }, el);
	const frag = scope.$doc.createDocumentFragment();
	while (dom.childNodes.length) frag.appendChild(dom.firstChild);
	return ctx.filter(frag, 'as', 'html');
}

