class HTMLSemaforTextArea extends HTMLTextAreaElement {
	set value(str) {
		super.value = str;
		this.#resize();
	}
	get value() {
		return super.value;
	}
	connectedCallback() {
		this.addEventListener('input', this);
	}
	disconnectedCallback() {
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
