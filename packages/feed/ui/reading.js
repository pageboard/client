class HTMLElementReading extends VirtualHTMLElement {
	static defaults = {
		for: null
	};

	patch(state) {
		state.finish(() => {
			const sel = this.options.for;
			if (!sel) {
				this.innerText = '?';
			} else {
				const node = document.querySelector(sel);
				if (!node) {
					this.innerText = '!';
				} else {
					this.innerText = Math.ceil(node.textContent.split(/\s+/).length / 200) + 'mn';
				}
			}
		});
	}
}

Page.ready(() => VirtualHTMLElement.define('element-reading', HTMLElementReading));

