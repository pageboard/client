import { default as PrettyBytes } from 'pretty-bytes';
import { stableStringify } from 'fast-safe-stringify';
import Duration from 'duration-relativetimeformat';
import { default as Speak } from 'speakingurl';

let duration;
function durationFormat(to, from) {
	if (!duration) duration = new Duration(document.documentElement.lang || "en");
	return duration.format(to, from);
}

function slug(str) {
	return Speak(str, {
		custom: {
			"_": "-"
		}
	});
}

window.Pageboard ??= {};
window.Pageboard.utils = {
	slug, durationFormat, stableStringify, PrettyBytes
};
