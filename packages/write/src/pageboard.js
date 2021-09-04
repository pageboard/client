exports.PrettyBytes = require('pretty-bytes');
exports.stableStringify = require('fast-safe-stringify').stableStringify;

const Duration = require('duration-relativetimeformat');
let duration;
exports.durationFormat = function (to, from) {
	if (!duration) duration = new Duration(document.documentElement.lang || "en");
	return duration.format(to, from);
};
