class HTMLElementPagination extends HTMLAnchorElement {
	#observer
	#queue
	#reached
	#size
	#visible
	#continue

	constructor() {
		super();
		this.init?.();
	}

	patch(state) {
		if (this.isContentEditable || this.closest('[block-content="template"]')) {
			return;
		}
		const name = this.dataset.name || 'offset';
		const off = parseInt(state.query[name]) || 0;
		const delta = parseInt(this.dataset.value) || 0;
		const cur = off + delta;
		const disabled = cur < 0 || !this.#findFetch() || this.#continue && delta < 0 || false;
		this.classList.toggle('disabled', disabled);

		if (disabled) {
			this.removeAttribute('href');
		} else {
			this.setAttribute('href', Page.format({
				pathname: state.pathname,
				query: Object.assign({}, state.query, {
					[name]: cur || undefined
				})
			}));
		}
		state.finish(() => {
			this.#reached = false;
			if (this.#updateFetchSize() == false) {
				this.removeAttribute('href');
				this.classList.toggle('disabled', true);
			} else {
				this.#continue = true;
			}
		});
	}

	#more(state) {
		this.#reached = true;
		if (this.#queue) this.#queue = this.#queue.then(() => {
			if (!this.#continue || !this.hasAttribute('href')) {
				return;
			}
			const fetch = this.#findFetch();
			if (fetch) {
				fetch.infinite = true;
				return state.push(this.getAttribute('href'));
			}
		}).then(() => {
			this.#reached = false;
		});
	}

	#updateFetchSize() {
		const old = this.#size;
		const cur = this.#size = this.#findFetch()?.ownView.children.length ?? 0;
		if (this.#continue) return old != cur;
		else return cur != 0;
	}

	#findFetch() {
		const name = this.dataset.name || 'offset';
		const fetch = this.ownerDocument.querySelector(
			`element-template[block-type="fetch"][parameters~="$query.${name}|or:0"]`
		);
		if (!fetch) {
			console.warn(`Pagination need Fetch to use $query.${name} parameter`);
		}
		return fetch;
	}

	handleClick(e, state) {
		const fetch = this.#findFetch();
		if (fetch) fetch.infinite = false;
	}

	paint(state) {
		const name = this.dataset.name || 'offset';
		const off = parseInt(state.query[name]) || 0;
		if (off == 0) {
			this.#continue = true;
			if (this.#visible) this.#more(state);
		}
	}

	setup(state) {
		if (this.isContentEditable || !this.#infinite) return;
		this.#queue = Promise.resolve();
		this.#observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (this.#reached) return;
				if (this.offsetParent && (entry.intersectionRatio || 0) !== 0) {
					this.#visible = true;
					this.#more(state);
				} else {
					this.#visible = false;
				}
			});
		}, {
			threshold: [1]
		});
		this.#observer.observe(this);
	}

	close() {
		this.#queue = null;
		if (this.#observer) {
			this.#observer.unobserve(this);
			this.#observer.disconnect();
			this.#observer = null;
		}
	}

	get #infinite() {
		return this.hasAttribute('data-infinite');
	}
}

VirtualHTMLElement.define('element-pagination', HTMLElementPagination, "a");
