exports.PrettyBytes = require('pretty-bytes');
exports.stableStringify = require('fast-safe-stringify').stableStringify;
const DurationFormat = require('duration-relativetimeformat');

Page.setup(function() {
	exports.Duration = DurationFormat(document.documentElement.lang || "en");
});

