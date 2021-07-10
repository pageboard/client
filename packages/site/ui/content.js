class HTMLElementContent extends VirtualHTMLElement {
	static defaults = {
		filter: null
	};

	patch(state) {
		if (this.isContentEditable) return;
		var filter = this.options.filter;
		if (filter) {
			filter = filter.split('\n');
			var selector = filter[0];
			if (filter.length > 1) filter[0] = '';
			else filter = [];
			var list = `[dom${filter.join('|')}]`.fuse({
				dom: Array.from(this.querySelectorAll(selector))
			});
			this.textContent = '';
			list.forEach((node) => this.appendChild(node));
		}
	}
}
Page.ready(function() {
	VirtualHTMLElement.define('element-content', HTMLElementContent);
});

