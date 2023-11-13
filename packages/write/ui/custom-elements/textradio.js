class HTMLElementTextRadio extends HTMLInputElement {

	connectedCallback() {
		this.#input.addEventListener('change', this);
		this.#input.addEventListener('input', this);
	}
	disconnectedCallback() {
		this.#input.removeEventListener('change', this);
		this.#input.removeEventListener('input', this);
	}
	handleEvent(e) {
		this.value = this.#input.value;
		Pageboard.trigger(this, 'change');
	}
	get #input() {
		return this.parentNode.querySelector('input[type="text"]');
	}
	set value(str) {
		this.#input.value = super.value = str;
	}
	get value() {
		super.value = this.#input.value;
		return super.value;
	}
}
window.customElements.define('element-textradio', HTMLElementTextRadio, { extends: "input" });
