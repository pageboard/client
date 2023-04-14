class HTMLElementTextArea extends Page.create(HTMLTextAreaElement) {
	handleChange(e, state) {
		this.#resize(state);
	}
	handleInput(e, state) {
		this.#resize(state);
	}
	setup(state) {
		this.#resize(state);
	}
	#resize(state) {
		if (state.scope.$write) {
			delete this.style.height;
			return;
		}
		this.style.height = 0;
		this.style.height = `calc(${this.scrollHeight}px + 1em)`;
	}
}

Page.define('element-textarea', HTMLElementTextArea, 'textarea');
