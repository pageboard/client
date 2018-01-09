class HTMLElementAccordion extends HTMLCustomElement {
	init() {
		this.click = this.click.bind(this);
	}
	connectedCallback() {
		this.addEventListener('click', this.click, false);
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.click, false);
	}
	click(e) {
		var title = e.target.closest('.title');
		if (!title) return;
		var fold = title.parentNode;
		if (!fold || !fold.matches('.fold')) return;
		var owner = fold.closest('element-accordion');
		if (owner != this) return;
		e.preventDefault();
		if (title.matches('.active')) {
			title.classList.remove('active');
			var content = title.nextElementSibling;
			if (content) content.classList.remove('active');
		} else {
			var all = Array.prototype.forEach.call(this.querySelectorAll('.fold > .active'), function(node) {
				node.classList.remove('active');
			});
			title.classList.add('active');
			var content = title.nextElementSibling;
			if (content) content.classList.add('active');
		}
	}
}

Page.setup(function() {
	window.customElements.define('element-accordion', HTMLElementAccordion);
});
