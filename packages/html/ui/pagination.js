class HTMLElementPagination extends Page.create(HTMLAnchorElement) {
	patch(state) {
		if (state.scope.$write) return;
		state.finish(() => {
			this.#update(state);
		});
	}

	#update(state) {
		const { fetch } = this.dataset;
		const node = this.ownerDocument.querySelector(
			`element-template[action="/.api/query/${fetch}"]`
		);
		if (!node) {
			console.warn("pagination does not find fetch node", fetch);
			return;
		}
		const { offsetName } = node.dataset;
		const offset = parseInt(node.dataset.offset) || 0;
		const limit = parseInt(node.dataset.limit) || 10;
		const count = parseInt(node.dataset.count) || 0;
		const sign = this.dataset.dir == "-" ? -1 : +1;
		const cur = sign > 0 ? offset + limit : offset - limit;

		this.setAttribute('href', Page.format({
			pathname: state.pathname,
			query: {
				...state.query,
				[offsetName]: cur
			}
		}));
		this.disabled = sign < 0 && cur < 0 || sign > 0 && cur >= count;
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
