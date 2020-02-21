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
require('./polyfills');
exports.cache = window.Pageboard && window.Pageboard.cache || {};
exports.debounce = require('debounce');
exports.fetch = require('./fetch');
exports.load = require('./load');
exports.render = require('./render');
exports.equivs = require('./equivs');

function initState(res, state) {
	var scope = state.scope;
	if (!scope.$doc) scope.$doc = document.cloneNode();
	scope.$loc = new URL(state.toString(), document.location);
	scope.$loc.searchParams.delete('develop');
	if (!res) return;
	if (res.grants) state.data.$grants = res.grants;
	if (res.hrefs) Object.assign(state.data.$hrefs, res.hrefs);
	scope.$hrefs = state.data.$hrefs; // backward compat FIXME get rid of this, data.$hrefs is good

	if (res.meta && res.meta.group == "page") {
		["grants", "links", "site", "lock", "granted"].forEach(function(k) {
			if (res[k] !== undefined) scope[`$${k}`] = res[k];
		});
		scope.$element = scope.$elements[res.meta.name];
	}
}

exports.bundle = function(loader, state) {
	var scope = state.scope;
	return loader.then(function(res) {
		if (!res) return Promise.resolve();
		var metas = [];
		if (res.meta) metas.push(res.meta);
		if (res.metas) metas = metas.concat(res.metas);
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
			if (!el.name) el.name = name;
			exports.render.install(el, scope);
		});
		return res;
	});
};

window.HTMLCustomElement = require('./HTMLCustomElement');

Page.init(function(state) {
	state.vars = {};
	state.data.$hrefs = {};
	var dev = state.query.develop;
	if (dev === "" || dev === "write") state.vars.develop = true;
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
		if (extra.length > 0) {
			console.warn("Unknown query parameters detected, rewriting location", extra);
			exports.equivs({
				Status: '302 Bad Parameters',
				Location: Page.format({pathname: state.pathname, query})
			});
			state.replace({pathname: state.pathname, query});
		} else if (missing.length > 0) {
			exports.equivs({
				Status: '400 Missing Parameters'
			});
		}
	});
});

Page.setup(function(state) {
	try {
		window.getSelection().removeAllRanges();
	} catch(ex) {
		// ignore
	}
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

