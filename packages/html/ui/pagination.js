class HTMLElementPagination extends HTMLAnchorElement {
	#observer;
	#queue;
	#locked;
	#visible;
	#name = 'offset';

	constructor() {
		super();
		this.init?.();
	}

	patch(state) {
		if (this.isContentEditable) return;
		state.finish(() => {
			const node = this.#getFetchNode();
			if (!node) {
				console.warn("pagination does not find fetch node", this.dataset.fetch);
				return;
			}
			const name = this.#name;
			const start = parseInt(node.dataset.start) || 0;
			const stop = parseInt(node.dataset.stop) || 0;
			const limit = parseInt(node.dataset.limit) || 10;
			const count = parseInt(node.dataset.count) || 0;
			const sign = this.dataset.dir == "-" ? -1 : +1;
			const cur = sign > 0 ? stop : (start - limit);


			this.setAttribute('href', Page.format({
				pathname: state.pathname,
				query: {
					...state.query,
					[name]: cur || undefined
				}
			}));
			this.disabled = sign < 0 && cur + limit <= 0 || sign > 0 && count < limit;
			this.#locked = false;
		});
	}

	#getFetchNode() {
		return this.ownerDocument.querySelector(`element-template[action="/.api/query/${this.dataset.fetch}"]`);
	}

	handleClick(e) {
		if (this.disabled) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}

	set disabled(val) {
		this.classList.toggle('disabled', val);
	}

	get disabled() {
		return this.classList.contains('disabled');
	}

	#more(state) {
		this.#locked = true;
		if (this.#queue) this.#queue = this.#queue.then(() => {
			if (!this.disabled) return state.push(this.getAttribute('href'));
		}).then(() => {
			this.#locked = false;
		});
	}

	paint(state) {
		const name = this.#name;
		const off = parseInt(state.query[name]) || 0;
		if (off == 0) {
			if (this.#visible) this.#more(state);
		}
	}

	setup(state) {
		if (this.isContentEditable || !this.dataset.infinite) return;
		this.#queue = Promise.resolve();
		this.#observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (this.#locked) return;
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
}

VirtualHTMLElement.define('element-pagination', HTMLElementPagination, "a");
