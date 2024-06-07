class HTMLSemaforTextArea extends HTMLTextAreaElement {

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
			this.style.height = `${this.scrollHeight + 2}px`;
		});
	}
}
window.customElements.define('semafor-textarea', HTMLSemaforTextArea, { extends: "textarea" });
