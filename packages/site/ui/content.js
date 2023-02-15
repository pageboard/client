class HTMLElementContent extends Page.Element {
	static defaults = {
		filter: null
	};

	patch(state) {
		if (this.isContentEditable) return;
		let filter = this.options.filter;
		if (filter) {
			filter = filter.split('\n');
			const selector = filter[0];
			if (filter.length > 1) filter[0] = '';
			else filter = [];
			const list = `[dom${filter.join('|')}]`.fuse({
				dom: Array.from(this.querySelectorAll(selector))
			}, state.scope);
			this.textContent = '';
			list.forEach(node => this.appendChild(node));
		}
	}
}

Page.define('element-content', HTMLElementContent);


