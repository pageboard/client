var Viewer = require('@pageboard/pagecut/src/viewer.js');

exports.elements = {
	error: {
		scripts: [],
		stylesheets: [],
		html: `<html>
		<head>
			<title>[status|or:500] [name]</title>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta name="robots" content="noindex">
			<meta http-equiv="Status" content="[status|or:500] [name]">
		</head>
		<body>
			<h2>[message]</h2>
			<p><code>[stack]</code></p>
		</body></html>`
	}
};

exports.view = new Viewer({
	elements: exports.elements,
	doc: document.cloneNode()
});

exports.debounce = require('debounce');
exports.fetch = require('./fetch');
exports.load = require('./load');
exports.render = require('./render');

function initScope(res, scope) {
	if (res.meta && res.meta.group == "page") {
		scope.$page = res.item;
		scope.$element = res.item && scope.$elements[res.item.type];
	}
}

exports.bundle = function(loader, scope) {
	return loader.then(function(res) {
		if (!res) return Promise.resolve();
		return exports.load.meta(res.meta).then(function() {
			return res;
		});
	}).catch(function(err) {
		return {
			meta: {
				group: 'page'
			},
			item: {
				type: 'error',
				data: {
					name: err.name,
					message: err.message,
					stack: err.stack,
					status: err.status
				}
			}
		};
	}).then(function(res) {
		if (res) initScope(res, scope);
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
	if (state.query.develop === undefined && state.referrer.query.develop !== undefined) {
		// copy from previous state
		state.query.develop = state.referrer.query.develop;
	}
	var dev = state.query.develop;
	state.vars = {
		develop: dev === null || dev === "write"
	};
	state.scope = {
		$elements: exports.elements,
		$doc: exports.view.doc,
		$render: exports.view.render.bind(exports.view),
		$write: dev == "write",
		$pathname: state.pathname,
		$query: state.query
	};
});

Page.patch(function(state) {
	state.finish(function() {
		var query = {};
		var extra = [];
		Object.keys(state.query).forEach(function(key) {
			if (state.vars[key] === undefined) {
				extra.push(key);
			} else {
				query[key] = state.query[key];
			}
		});
		if (extra.length > 0) {
			console.warn("Unknown query parameters detected, rewriting location", extra);
			document.head.appendChild(document.dom(`
				<meta http-equiv="Status" content="301 Bad query parameters">
				<meta http-equiv="Location" content="${Page.format({query: query})}">
			`));
			state.replace({query: query});
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

function merge(data, expr) {
	if (!expr) return data;
	var copy = Object.assign({}, data);
	Object.keys(expr).forEach(function(key) {
		var val = expr[key];
		if (val == null) return;
		else if (typeof val == "object") {
			copy[key] = merge(copy[key], val);
		} else {
			copy[key] = val;
		}
	});
	return copy;
};

