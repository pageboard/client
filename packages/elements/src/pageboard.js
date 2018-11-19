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
	Object.keys(res).forEach(function(name) {
		if (name != "item" && scope['$'+name] === undefined) scope['$'+name] = res[name];
	});
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

function updateState(s) {
	Object.assign(s.scope, {
		$pathname: s.pathname,
		$query: s.query || {}
	});
	if (s.query.develop === null || s.query.develop == "write") {
		s.vars.develop = true;
	}
	s.scope.$write = s.query.develop == "write";
}

window.HTMLCustomElement = require('./HTMLCustomElement');

Page.init(function(state) {
	state.vars = {};
	state.scope = {
		$elements: exports.elements,
		$doc: exports.view.doc,
		$render: exports.view.render.bind(exports.view)
	};
});
Page.ready(function(state) {
	updateState(state);
});
Page.patch(function(state) {
	Page.patch(function() { // this is a way to append after all other calls to patch
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
			return state.replace({query: query});
		}
	});
});

Page.setup(function() {
	if (exports.adv) return;
	exports.adv = true;
	if (window.parent == window) {
		console.info("Powered by https://pageboard.fr");
	}
});
