exports.PrettyBytes = require('pretty-bytes');
exports.stableStringify = require('fast-safe-stringify').stableStringify;
const Duration = require('duration-relativetimeformat');

Page.setup(function() {
	exports.durationFormat = new Duration(document.documentElement.lang || "en");
});

