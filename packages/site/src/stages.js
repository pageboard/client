
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

	#getEquiv(name) {
		const node = document.head.querySelector(`meta[http-equiv="${name}"]`);
		return this.#parseEquiv(node?.content);
	}

	#setEquiv(name, value) {
		const { head } = document;
		let node = head.querySelector(`meta[http-equiv="${name}"]`);
		if (value === null) {
			node?.remove();
		} else {
			let curs;
			if (!node) {
				const meta = head.querySelector('meta');
				node = head.dom(`<meta http-equiv="${name}">`);
				head.insertBefore(node, meta?.nextElementSibling);
				curs = [];
			} else {
				curs = this.#parseEquiv(node.content);
			}
			const adds = this.#parseEquiv(value);
			for (const tok of adds) if (!curs.includes(tok)) curs.push(tok);
			node.content = curs.join(', ');
		}
	}

	#parseEquiv(str) {
		if (!str) return [];
		if (Array.isArray(str)) return str;
		return str.split(',').map(str => str.trim()).filter(str => Boolean(str.length));
	}

	ready(state) {
		state.scope.$locks = this.#getEquiv('X-Upcache-Lock');
	}

	patch(state) {
		if (state.scope.$write) return;
		state.scope.$locks = this.#parseEquiv(state.scope.$locks);
		let [equivStatus] = this.#getEquiv('Status');
		if (equivStatus) {
			this.#setEquiv('Status', null); // eat it
			state.status = parseInt(equivStatus);
			state.statusText = equivStatus.substring(state.status.toString().length).trim();
		}
		state.finish(() => {
			state.finish(() => {
				this.#setEquiv('X-Upcache-Lock', state.scope.$locks);
				this.#setEquiv('X-Upcache-Tag', state.scope.$tags);
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
					equivStatus = `${state.status} ${state.statusText || ""}`.trim();
					if (state.status != 200) {
						// eslint-disable-next-line no-console
						console.info(equivStatus);
					}
					this.#setEquiv('Status', equivStatus);
				}
				if (state.location) {
					if (state.location != state.toString()) {
						this.#setEquiv('Location', state.location);
					} else {
						console.warn("Not redirecting to same url", state.location);
					}
				}
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
