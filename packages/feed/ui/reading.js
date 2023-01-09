class HTMLElementReading extends VirtualHTMLElement {
	static defaults = {
		for: null
	};

	patch(state) {
		state.finish(() => {
			const sel = this.options.for;
			const body = this.closest('main');
			const node = sel ? body.querySelector(sel) : this.closest('.view') ?? body;
			if (!node) {
				this.innerText = 'n/a';
			} else {
				this.innerText = Math.ceil(node.textContent.split(/\s+/).length / 200) + 'mn';
			}
		});
	}
}

Page.patch(
	() => VirtualHTMLElement.define('element-reading', HTMLElementReading)
);
