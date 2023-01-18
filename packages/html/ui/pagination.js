class HTMLElementPagination extends HTMLAnchorElement {
	#observer;
	#queue;
	#locked;
	#moreDown;
	#name = 'offset';

	constructor() {
		super();
		this.init?.();
	}

	patch(state) {
		if (this.isContentEditable) return;
		state.finish(() => {
			this.#update(state);
		});
	}

	#update(state) {
		const node = this.#node;
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
	}
	handleClick(e) {
		if (this.disabled) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}

	set disabled(val) {
		this.classList.toggle('disabled', val);
		if (val && this.parentNode.matches('.menu') && this.parentNode.children.length == 1) {
			this.parentNode.hidden = true;
		} else if (!val) {
			this.parentNode.hidden = false;
		}
	}

	get disabled() {
		return this.classList.contains('disabled');
	}

	get #node() {
		return this.ownerDocument.querySelector(
			`element-template[action="/.api/query/${this.dataset.fetch}"]`
		);
	}

	#more(state, node) {
		this.#locked = true;

		if (this.#queue) this.#queue = this.#queue.then(() => {
			if (this.disabled) return;
			const { query } = state;
			state.query = Object.assign({}, query, Page.parse(this.getAttribute('href')).query);
			return node.fetch(state)
				.then(() => this.#update(state))
				.then(() => {
					state.query = query;
				});
		}).then(() => {
			this.#locked = false;
		});
	}

	setup(state) {
		if (this.isContentEditable) return;
		if (!this.dataset.infinite || this.dataset.dir == "-") return;
		this.#queue = Promise.resolve();
		const node = this.#node;
		this.#observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					this.#moreDown = true;
					if (!this.#locked) this.#more(state, node);
				} else {
					this.#moreDown = false;
				}
			});
		}, {
			threshold: [1.0]
		});
		const observed = node.lastElementChild.matches('.pagination-helper') ?
			node.lastElementChild :
			node.appendChild(node.dom(`<div class="pagination-helper"></div>`));
		this.#observer.observe(observed);
	}

	close() {
		this.#queue = null;
		if (this.#observer) {
			this.#observer.unobserve(this.#node.lastElementChild);
			this.#observer.disconnect();
			this.#observer = null;
		}
	}
}

VirtualHTMLElement.define('element-pagination', HTMLElementPagination, "a");
