class HTMLElementAccordion extends VirtualHTMLElement {
	handleClick(e) {
		var title = e.target.closest('.title');
		if (!title) return;
		var fold = title.parentNode;
		if (!fold || !fold.matches('.fold,element-accordion')) return;
		var owner = fold.closest('element-accordion');
		if (owner != this) return;
		if (e.target.closest("a[href]") == null) e.preventDefault();
		HTMLElementAccordion.toggle(title);
	}
	static toggle(title) {
		var id = title.parentNode.id;
		var content = title.nextElementSibling;
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
		Object.keys(HTMLElementAccordion.folds).forEach(function(id) {
			var node = document.getElementById(id);
			if (!node) delete HTMLElementAccordion.folds[id];
			var title = node.querySelector('.title');
			HTMLElementAccordion.toggle(title);
		});
	}
}

HTMLElementAccordion.folds = {};

Page.setup(function(state) {
	VirtualHTMLElement.define('element-accordion', HTMLElementAccordion);
	HTMLElementAccordion.refreshAll();
});

Page.patch(function(state) {
	HTMLElementAccordion.refreshAll();
});
