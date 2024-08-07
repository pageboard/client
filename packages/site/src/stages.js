
import * as equivs from './equivs';

class TrackingIntersectionObserver extends IntersectionObserver {
	#targets = new Set();
	observe(node) {
		this.#targets.add(node);
		return super.observe(node);
	}
	unobserve(node) {
		this.#targets.delete(node);
		return super.unobserve(node);
	}
	disconnect() {
		this.#targets.clear();
		return super.disconnect();
	}
	unobserveAll() {
		const list = new Set(this.#targets);
		for (const node of this.#targets) {
			super.unobserve(node);
		}
		this.#targets.clear();
		return list;
	}
}

Page.connect(new class {
	#adv = false;

	patch(state) {
		if (state.scope.$write) return;
		const metas = equivs.read();
		if (metas.Status) {
			// eat it
			const doc = state.doc ?? document;
			doc.head.querySelector('meta[http-equiv="Status"]').remove();
			state.status = parseInt(metas.Status);
			state.statusText = metas.Status.substring(state.status.toString().length).trim();
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
					if (state.status != 200) {
						// eslint-disable-next-line no-console
						console.info(metas.Status);
					}
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
	}

	paint(state) {
		state.finish(() => {
			if (state.scope.$write || state.location == null) return;
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
	}

	setup(state) {
		try {
			window.getSelection().removeAllRanges();
		} catch (ex) {
			// ignore
		}
		state.scope.observer = new TrackingIntersectionObserver((entries, observer) => {
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

		if (!this.#adv) {
			this.#adv = true;
			state.finish(() => {
				if (window.parent == window) {
					// eslint-disable-next-line no-console
					console.info("Powered by pageboard");
				}
			});
		}
	}

	close(state) {
		if (state.scope.observer) {
			state.scope.observer.disconnect();
			delete state.scope.observer;
		}
	}
});
