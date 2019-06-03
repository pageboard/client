exports.elements = window.Pageboard && window.Pageboard.elements || {
	error: {
		scripts: [],
		stylesheets: [],
		html: `<html>
		<head>
			<title>[$status|or:500] [$statusText|or:Error]</title>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta name="robots" content="noindex">
			<meta http-equiv="Status" content="[$status|or:500] [$statusText|or:Error]">
		</head>
		<body>
			<h2>[message]</h2>
			<p><code>[stack]</code></p>
		</body></html>`
	}
};

exports.cache = window.Pageboard && window.Pageboard.cache || {};
exports.debounce = require('debounce');
exports.fetch = require('./fetch');
exports.load = require('./load');
exports.render = require('./render');

function initState(res, state) {
	var scope = state.scope;
	if (!scope.$doc) scope.$doc = document.cloneNode();
	if (!res) return;
	if (res.grants) state.data.$grants = res.grants;
	if (res.meta && res.meta.group == "page") {
		["grants", "hrefs", "links", "site"].forEach(function(k) {
			if (res[k] !== undefined) scope[`$${k}`] = res[k];
		});
		scope.$element = res.item && scope.$elements[res.item.type];
	}
}

exports.bundle = function(loader, state) {
	var scope = state.scope;
	return loader.then(function(res) {
		if (!res) return Promise.resolve();
		var metas = res.metas || res.meta && [res.meta] || [];
		return Promise.all(metas.map(function(meta) {
			return exports.load.meta(meta);
		})).then(function() {
			return res;
		});
	}).catch(function(err) {
		return {
			meta: {
				group: 'page'
			},
			status: err.status || -1,
			statusText: err.message,
			item: {
				type: 'error',
				data: {
					name: err.name,
					stack: err.stack
				}
			}
		};
	}).then(function(res) {
		initState(res, state);
		var elts = scope.$elements;
		Object.keys(elts).forEach(function(name) {
			var el = elts[name];
			exports.render.install(el, scope);
		});
		return res;
	});
};

window.HTMLCustomElement = require('./HTMLCustomElement');

Page.init(function(state) {
	state.vars = {};
	state.options = function(id, list) {
		var opts = {};
		Object.keys(state.query).forEach(function(key) {
			var [qid, name] = key.split('.');
			if (name == null || qid != id) return;
			if (list.includes(name)) {
				opts[name] = state.query[key];
				state.vars[key] = true;
			}
		});
		return opts;
	}
	var dev = state.query.develop;
	if (dev === null || dev === "write") state.vars.develop = true;
	var scope = state.scope;
	if (!scope) scope = state.scope = {
		$elements: exports.elements,
		$filters: {}
	};
	// once elements are installed they all refer to the same scope object
	scope.$write = dev == "write";
});

Page.patch(function(state) {
	state.finish(function() {
		var query = {};
		var extra = [];
		var missing = [];
		Object.keys(state.query).forEach(function(key) {
			if (state.vars[key] === undefined) {
				extra.push(key);
			} else {
				query[key] = state.query[key];
			}
		});
		Object.keys(state.vars).forEach(function(key) {
			if (state.vars[key] === false) missing.push(key);
		});
		var head = document.head;
		if (extra.length > 0) {
			console.warn("Unknown query parameters detected, rewriting location", extra);
			head.appendChild(head.dom(`
				<meta http-equiv="Status" content="301 Bad query parameters">
				<meta http-equiv="Location" content="${Page.format({query: query})}">
			`));
			state.replace({query: query});
		} else if (missing.length > 0) {
			head.appendChild(head.dom(`<meta http-equiv="Status" content="400 Missing query parameters">`));
		}
	});
});

Page.setup(function(state) {
	if (exports.adv) return;
	exports.adv = true;
	state.finish(function() {
		if (window.parent == window) {
			console.info("Powered by https://pageboard.fr");
		}
	});
});

exports.merge = merge;

function merge(obj, extra, fn) {
	var single = arguments.length == 2;
	if ((fn == null || single) && typeof extra == "function") {
		fn = extra;
		extra = obj;
		obj = {};
	}
	if (!extra) return obj;
	var copy = Object.assign({}, obj);
	Object.keys(extra).forEach(function(key) {
		var val = extra[key];
		if (val == null) {
			return;
		} else if (typeof val == "object") {
			copy[key] = single ? merge(val, fn) : merge(copy[key], val, fn);
		} else {
			if (fn) {
				var fval = single ? fn(val) : fn(copy[key], val);
				if (fval !== undefined) val = fval;
			}
			copy[key] = val;
		}
	});
	return copy;
}
