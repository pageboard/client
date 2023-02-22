class HTMLElementAccordion extends Page.Element {
	handleClick(e) {
		const title = e.target.closest('.title');
		if (!title) return;
		const fold = title.parentNode;
		if (!fold || !fold.matches('.fold,element-accordion')) return;
		const owner = fold.closest('element-accordion');
		if (owner != this) return;
		if (e.target.closest("a[href]") == null) e.preventDefault();
		this.constructor.toggle(title);
	}
	static toggle(title) {
		const content = title.nextElementSibling;
		if (title.matches('.active')) {
			title.classList.remove('active');
			if (content) content.classList.remove('active');
		} else {
			title.classList.add('active');
			if (content) content.classList.add('active');
		}
	}
}

Page.define('element-accordion', HTMLElementAccordion);
