var Viewer = require('pagecut/src/viewer.js');

exports.elements = {
	error: {
		html: `<html>
		<head>
			<meta http-equiv="Status" content="[status] [message]">
		</head>
		<body>[body]</body></html>`
	}
};

exports.view = new Viewer({
	elements: exports.elements,
	doc: document.cloneNode()
});

exports.debounce = require('debounce');
exports.fetch = require('./fetch');
exports.script = require('./script');
exports.build = require('./build');

window.HTMLCustomElement = require('./HTMLCustomElement');

Page.setup(function() {
	if (exports.adv) return;
	exports.adv = true;
	if (window.parent == window) {
		console.info("Powered by https://pageboard.fr");
	}
});
