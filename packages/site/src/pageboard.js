export { default as debounce } from 'debounce';
export { default as fetch } from './fetch';
import '@ungap/custom-elements';
import * as load from './load';
import { render, install } from './render';
import * as equivs from './equivs';
import Scope from './scope';
import * as Class from './class';
import { Deferred } from 'class-deferred';
import 'window-page';

window.Deferred = Deferred;

for (const key in Class) {
	Object.defineProperty(Page.constructor.prototype, key, {
		value: Class[key]
	});
}

const baseElements = window.Pageboard?.elements ?? {
	error: {
		scripts: [],
		stylesheets: [],
		html: `<html>
		<head>
			<title>[$status|or:500] [$statusText|or:Error]</title>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta name="robots" content="noindex">
			<meta http-equiv="Status" content="[$status|or:500] [$statusText|or:Error]">
		</head>
		<body>
			<h2>[message]</h2>
			<p><code>[stack]</code></p>
		</body></html>`
	}
};
import './polyfills';
const cache = window.Pageboard?.cache ?? {};

export {
	cache,
	baseElements as elements,
	load,
	render,
	install,
	equivs,
	bundle,
	merge
};

function initState(res, state) {
	const { scope, referrer, pathname } = state;
	if (!scope.$doc) scope.$doc = document.cloneNode();
	scope.$referrer = referrer.pathname || pathname;
	if (!res) return;
	if (res.grants) {
		scope.$write = Boolean(res.grants.webmaster);
	}
	for (const k of ["grants", "links", "site", "locked", "granted", "hrefs", "commons", "meta", "status", "statusText"]) {
		if (res[k] !== undefined) scope[`$${k}`] = res[k];
	}
	if (res.item && !scope.$element) {
		scope.$element = scope.$elements[res.item.type];
	}
}

async function bundle(state, res) {
	const { scope } = state;
	try {
		await load.meta(state, res.meta);
		initState(res, state);
		const elts = scope.$elements;
		for (const name of Object.keys(elts)) {
			const el = elts[name];
			if (!el.name) el.name = name;
			install(el, scope);
		}
	} catch(err) {
		Object.assign(res, {
			meta: {
				group: 'page'
			},
			status: err.status || -1,
			statusText: err.message,
			item: {
				type: 'error',
				data: {
					name: err.name,
					stack: err.stack
				}
			}
		});
	}
}

Page.init(state => {
	state.vars = {};
	state.data.$hrefs = {};
	if (!state.scope) state.scope = new Scope(state, {
		$elements: baseElements,
		$filters: {}
	});
	else state.scope.update(state);
});

Page.patch(async state => {
	const metas = equivs.read();
	if (metas.Status) {
		state.status = parseInt(metas.Status);
		state.statusText = metas.Status.substring(state.status.toString().length).trim();
	}
	state.finish(() => state.finish(() => {
		const query = {};
		const extra = [];
		const missing = [];
		let status = 200, statusText = "OK";
		let location;
		if (!state.status) state.status = 200;

		for (const key of Object.keys(state.query)) {
			if (state.vars[key] === undefined) {
				extra.push(key);
			} else {
				query[key] = state.query[key];
			}
		}
		for (const key of Object.keys(state.vars)) {
			if (state.vars[key] === false) missing.push(key);
		}
		if (extra.length > 0) {
			// eslint-disable-next-line no-console
			console.warn("Removing extra query parameters", extra);
			status = 301;
			statusText = 'Extra Query Parameters';
			location = Page.format({ pathname: state.pathname, query });
		} else if (missing.length > 0) {
			status = 400;
			statusText = 'Missing Query Parameters';
		}
		if (status > state.status) {
			state.status = status;
			state.statusText = statusText;
			if (location) state.location = location;
		}

		if (state.status) {
			metas.Status = `${state.status} ${state.statusText || ""}`.trim();
		}
		if (state.location) {
			if (state.location != state.toString()) {
				metas.Location = state.location;
			} else {
				console.warn("Not redirecting to same url", state.location);
			}
		}

		equivs.write(metas);
	}));
});

Page.paint(async state => {
	if (state.scope.$write) return;
	state.finish(() => {
		const metas = equivs.read();
		if (!metas.Location) return;
		const loc = Page.parse(metas.Location);
		let same = true;

		if (state.samePathname(loc)) {
			if (state.sameQuery(loc)) {
				// do nothing
			} else if (Object.keys(loc.query).every(key => loc.query[key] === state.query[key])) {
				// different but handled here - keep same data
				setTimeout(() => state.replace(loc, { data: state.data }));
			} else {
				// handled below
				same = false;
			}
		} else {
			same = false;
		}
		if (!same) {
			setTimeout(() => state.push(loc));
		}
	});
});
let adv = false;
Page.setup(state => {
	try {
		window.getSelection().removeAllRanges();
	} catch(ex) {
		// ignore
	}
	if (adv) return;
	adv = true;
	state.finish(() => {
		if (window.parent == window) {
			// eslint-disable-next-line no-console
			console.info("Powered by https://pageboard.fr");
		}
	});
});

function merge(obj, extra, fn) {
	const single = arguments.length == 2;
	if ((fn == null || single) && typeof extra == "function") {
		fn = extra;
		extra = obj;
		obj = {};
	}
	if (!extra) return obj;
	const copy = { ...obj };
	for (const [key, val] of Object.entries(extra)) {
		if (val == null) {
			continue;
		} else if (typeof val == "object") {
			copy[key] = single ? merge(val, fn) : merge(copy[key], val, fn);
		} else if (fn) {
			copy[key] = single ? fn(val) : fn(copy[key], val);
		} else {
			copy[key] = val;
		}
	}
	return copy;
}

Page.setup(state => {
	state.scope.observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			const target = entry.target;
			const ratio = entry.intersectionRatio || 0;
			if (ratio <= 0) return;
			if ((target.constructor.revealRatio || 0) > ratio) return;
			observer.unobserve(target);
			if (target.currentSrc) return;
			target.reveal(state);
		});
	}, {
		threshold: [
			0.001,	// images
			0.2,		// embeds
			1				// headings
		],
		rootMargin: "30px"
	});
});

Page.close(state => {
	if (state.scope.observer) {
		state.scope.observer.disconnect();
		delete state.scope.observer;
	}
});
