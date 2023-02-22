class HTMLElementReading extends Page.Element {
	static defaults = {
		for: null,
		speed: (x) => parseInt(x) || 200,
	};

	patch(state) {
		state.finish(() => {
			const sel = this.options.for;
			const body = this.closest('main');
			const node = sel ? body.querySelector(sel) : this.closest('.view') ?? body;
			if (!node) {
				this.innerText = 'n/a';
			} else {
				this.innerText = Math.ceil(node.textContent.split(/\s+/).length / this.options.speed) + 'mn';
			}
		});
	}
}

Page.define('element-reading', HTMLElementReading);

