class HTMLElementRating extends HTMLCustomElement {
	static get observedAttributes() {
		return ['maximum', 'value'];
	}
	connectedCallback() {
		this.update();
	}
	update() {
		var maximum = parseInt(this.getAttribute('maximum'));
		var value = parseFloat(this.getAttribute('value'));
		var char = this.getAttribute('char');
		if (!char) char = '⭐';
		while (this.children.length > maximum) {
			this.firstElementChild.remove();
		}
		while (this.children.length < maximum) {
			this.insertAdjacentHTML('beforeEnd', `<i class="icon" data-char="${char}"></i>`);
		}
		Array.from(this.children).forEach(function(item, i) {
			item.dataset.char = char;
			item.classList.toggle('active', i + 1 <= value);
		});
	}
	disconnectedCallback() {
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-rating', HTMLElementRating);
});
