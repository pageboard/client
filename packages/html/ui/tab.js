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
		const id = this.id;

		this.items.children.forEach((item, i) => {
			const query = { ...state.query };
			const key = `${id}.index`;
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
