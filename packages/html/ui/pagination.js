class HTMLElementPagination extends Page.create(HTMLAnchorElement) {
	patch(state) {
		if (state.scope.$write) return;
		state.finish(() => {
			this.#update(state);
		});
	}

	#update(state) {
		const node = this.ownerDocument.querySelector(
			`element-template[action="/.api/query/${this.dataset.fetch}"]`
		);
		if (!node) {
			console.warn("pagination does not find fetch node", this.dataset.fetch);
			return;
		}
		const name = node.dataset.pagination;
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
	}

	get disabled() {
		return this.classList.contains('disabled');
	}
}

Page.define('element-pagination', HTMLElementPagination, "a");
