export { default as PrettyBytes } from 'pretty-bytes';
export { stableStringify } from 'fast-safe-stringify';
import Duration from 'duration-relativetimeformat';

let duration;
export function durationFormat(to, from) {
	if (!duration) duration = new Duration(document.documentElement.lang || "en");
	return duration.format(to, from);
}
