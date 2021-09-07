export { default as debounce } from 'debounce';
export { default as fetch } from './fetch';
import * as load from './load';
import { render, install } from './render';
import * as equivs from './equivs';
import VHE from './VirtualHTMLElement';

window.VirtualHTMLElement ||= VHE;

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
	equivs,
	bundle,
	merge
};

function initState(res, state) {
	const scope = state.scope;
	if (!scope.$doc) scope.$doc = document.cloneNode();
	scope.$loc = new URL(state.toString(), document.location);
	scope.$loc.searchParams.delete('develop');
	scope.$loc.query = Object.assign({}, state.query);
	delete scope.$loc.query.develop;
	if (!res) return;
	if (res.grants) state.data.$grants = res.grants;
	if (res.hrefs) Object.assign(state.data.$hrefs, res.hrefs);
	scope.$hrefs = state.data.$hrefs; // backward compat FIXME get rid of this, data.$hrefs is good

	if (res.meta?.group == "page") {
		["grants", "links", "site", "locked", "granted"].forEach(function(k) {
			if (res[k] !== undefined) scope[`$${k}`] = res[k];
		});
		scope.$element = scope.$elements[res.meta.name];
	}
}

function bundle(loader, state) {
	const scope = state.scope;
	return loader.then(function(res) {
		if (!res) return Promise.resolve();
		const metas = [];
		if (res.meta) metas.push(res.meta);
		if (res.metas) metas.push(...res.metas);
		return Promise.all(metas.map(function(meta) {
			if (meta.group == "page" && !res.meta) {
				// restores an asymmetry between route bundle load
				// and navigational bundle load
				res.meta = meta;
			}
			return load.meta(meta);
		})).then(function() {
			return res;
		});
	}).catch(function (err) {
		return {
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
		};
	}).then(function(res) {
		initState(res, state);
		const elts = scope.$elements;
		Object.keys(elts).forEach(function(name) {
			const el = elts[name];
			if (!el.name) el.name = name;
			install(el, scope);
		});
		return res;
	});
}

Page.init(function(state) {
	state.vars = {};
	state.data.$hrefs = {};
	const dev = state.query.develop;
	if (dev === "" || dev === "write") state.vars.develop = true;
	let scope = state.scope;
	if (!scope) scope = state.scope = {
		$elements: baseElements,
		$filters: {}
	};
	// once elements are installed they all refer to the same scope object
	scope.$write = dev == "write";
});

Page.patch(function (state) {
	const metas = equivs.read();
	if (metas.Status) {
		state.status = parseInt(metas.Status);
		state.statusText = metas.Status.substring(state.status.toString().length).trim();
	}

	state.finish(function() {
		const query = {};
		const extra = [];
		const missing = [];
		let status = 200, statusText = "OK";
		let location;
		if (!state.status) state.status = 200;

		Object.keys(state.query).forEach(function(key) {
			if (state.vars[key] === undefined) {
				extra.push(key);
			} else {
				query[key] = state.query[key];
			}
		});
		Object.keys(state.vars).forEach(function(key) {
			if (state.vars[key] === false) missing.push(key);
		});
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
	});
});

Page.paint(function (state) {
	if (state.scope.$write) return;
	state.finish(() => {
		const metas = equivs.read();
		if (!metas.Location) return;
		const loc = Page.parse(metas.Location);
		let same = true;

		if (state.samePathname(state)) {
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
Page.setup(function(state) {
	try {
		window.getSelection().removeAllRanges();
	} catch(ex) {
		// ignore
	}
	if (adv) return;
	adv = true;
	state.finish(function() {
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
	const copy = Object.assign({}, obj);
	Object.keys(extra).forEach(function (key) {
		let val = extra[key];
		if (val == null) {
			return;
		} else if (typeof val == "object") {
			copy[key] = single ? merge(val, fn) : merge(copy[key], val, fn);
		} else {
			if (fn) {
				val = single ? fn(val) : fn(copy[key], val);
			}
			copy[key] = val;
		}
	});
	return copy;
}

Page.setup(function(state) {
	if (window.IntersectionObserver) {
		state.ui.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
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
	}
});

Page.close(function(state) {
	if (state.ui.observer) {
		state.ui.observer.disconnect();
		delete state.ui.observer;
	}
});
