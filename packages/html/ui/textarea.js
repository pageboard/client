class HTMLElementTextArea extends Page.create(HTMLTextAreaElement) {
	set value(str) {
		super.value = str;
		this.#resize();
	}
	handleInput() {
		this.#resize();
	}
	setup() {
		this.#resize();
	}
	#resize() {
		requestAnimationFrame(() => {
			this.style.height = 0;
			this.style.height = `calc(${this.scrollHeight}px + 1em)`;
		});
	}
}

Page.define('element-textarea', HTMLElementTextArea, 'textarea');
