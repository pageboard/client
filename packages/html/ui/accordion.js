class HTMLElementAccordion extends VirtualHTMLElement {
	handleClick(e) {
		const title = e.target.closest('.title');
		if (!title) return;
		const fold = title.parentNode;
		if (!fold || !fold.matches('.fold,element-accordion')) return;
		const owner = fold.closest('element-accordion');
		if (owner != this) return;
		if (e.target.closest("a[href]") == null) e.preventDefault();
		HTMLElementAccordion.toggle(title);
	}
	static toggle(title) {
		const id = title.parentNode.id;
		const content = title.nextElementSibling;
		if (title.matches('.active')) {
			if (id) delete HTMLElementAccordion.folds[id];
			title.classList.remove('active');
			if (content) content.classList.remove('active');
		} else {
			if (id) HTMLElementAccordion.folds[id] = true;
			title.classList.add('active');
			if (content) content.classList.add('active');
		}
	}
	static refreshAll() {
		for (const id of Object.keys(HTMLElementAccordion.folds)) {
			const node = document.getElementById(id);
			if (!node) delete HTMLElementAccordion.folds[id];
			const title = node.querySelector('.title');
			HTMLElementAccordion.toggle(title);
		}
	}
}

HTMLElementAccordion.folds = {};

Page.setup(() => {
	VirtualHTMLElement.define('element-accordion', HTMLElementAccordion);
	HTMLElementAccordion.refreshAll();
});

Page.patch(() => HTMLElementAccordion.refreshAll());
