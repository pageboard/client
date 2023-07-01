
import * as equivs from './equivs';

Page.patch(async state => {
	const metas = equivs.read();
	if (metas.Status) {
		// probably a very bad idea
		// will keep 301 when staying on the same pathname,
		// since window-page won't mergeHead and won't remove the meta status
		// state.status = parseInt(metas.Status);
		// state.statusText = metas.Status.substring(state.status.toString().length).trim();
	}
	state.finish(() => {
		state.finish(() => {
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
		});
	});
});

Page.paint(state => {
	if (state.scope.$write) return;
	state.finish(() => {
		if (state.location == null) return;
		const loc = Page.parse(state.location);
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
	} catch (ex) {
		// ignore
	}
	if (adv) return;
	adv = true;
	state.finish(() => {
		if (window.parent == window) {
			// eslint-disable-next-line no-console
			console.info("Powered by pageboard");
		}
	});
});

Page.setup(state => {
	state.scope.observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			const target = entry.target;
			const ratio = entry.intersectionRatio || 0;
			if (ratio <= 0) return;
			if ((target.constructor.revealRatio || 0) > ratio) return;
			observer.unobserve(target);
			if (target.currentSrc) return;
			state.reveal(target);
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
