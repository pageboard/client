class HTMLElementTabs extends Page.Element {
	static defaults = {
		index: (x) => parseInt(x) || 0
	};

	get items() {
		return this.querySelector('[block-content="items"]');
	}
	get tabs() {
		return this.querySelector('[block-content="tabs"]');
	}
	patch(state) {
		const pos = this.options.index;
		const key = `${this.id}.index`;
		state.vars[key] = true;

		this.items.children.forEach((item, i) => {
			const query = { ...state.query };
			if (i == 0) delete query[key];
			else query[key] = i;
			item.setAttribute('href', Page.format({
				pathname: state.pathname,
				query: query
			}));
			item.classList.toggle('active', i == pos);
		});
		this.tabs.children.forEach((item, i) => {
			item.classList.toggle('active', i == pos);
		});
	}
}

Page.define('element-tabs', HTMLElementTabs);
