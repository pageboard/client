var Viewer = require('@pageboard/pagecut/src/viewer.js');

exports.elements = {
	error: {
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
exports.build = require('./build');

window.HTMLCustomElement = require('./HTMLCustomElement');

window.addEventListener('pagepatch', function(e) {
	var state = e.state;
	var query = {};
	var extra = [];
	Object.keys(state.query).forEach(function(key) {
		if (state.data[key] === undefined) {
			extra.push(key);
		} else {
			query[key] = state.query[key];
		}
	});
	if (extra.length > 0) {
		console.warn("Unknown query parameters detected, rewriting location", extra);
		return Page.replace({query: query}, state);
	}
});

Page.setup(function() {
	if (exports.adv) return;
	exports.adv = true;
	if (window.parent == window) {
		console.info("Powered by https://pageboard.fr");
	}
});
