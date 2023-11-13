class HTMLElementTextArea extends HTMLTextAreaElement {

	connectedCallback() {
		this.addEventListener('change', this);
		this.addEventListener('input', this);
		this.#resize();
	}
	disconnectedCallback() {
		this.removeEventListener('change', this);
		this.removeEventListener('input', this);
	}
	handleEvent(e) {
		this.#resize();
	}
	#resize() {
		requestAnimationFrame(() => {
			this.style.height = 0;
			this.style.height = `calc(${this.scrollHeight}px + 0.5em)`;
		});
	}
}
window.customElements.define('element-textarea', HTMLElementTextArea, { extends: "textarea" });
