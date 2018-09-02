var Viewer = require('pagecut/src/viewer.js');

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

Page.setup(function() {
	if (exports.adv) return;
	exports.adv = true;
	if (window.parent == window) {
		console.info("Powered by https://pageboard.fr");
	}
});
