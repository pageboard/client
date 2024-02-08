import { default as PrettyBytes } from 'pretty-bytes';
import { stableStringify } from 'fast-safe-stringify';
import Duration from 'duration-relativetimeformat';
import { default as Speak } from 'speakingurl';
import { default as Cropper } from 'cropperjs';

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
	slug, durationFormat, stableStringify, PrettyBytes, Cropper
};

Object.isEmpty ??= function (obj) {
	if (obj == null) return true;
	if (Array.isArray(obj)) return obj.length === 0;
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			return false;
		}
	}
	return JSON.stringify(obj) === JSON.stringify({});
};
