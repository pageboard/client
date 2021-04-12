class HTMLElementFieldsetList extends VirtualHTMLElement {
	update() {
		let prefix = this.getAttribute('prefix');
		if (prefix) prefix += ".";
		else prefix = "";
		this.container.children.forEach((node, i) => {
			node.querySelectorAll('[name]').forEach(function (node) {
				if (node.type == "button" || !node.name) return;
				if (!node.dataset.name) node.dataset.name = node.name;
				node.name = `${prefix}${i}.${node.dataset.name}`;
			});
		});
	}
	patch(state) {
		const copy = Object.assign({}, state.scope);
		copy.$filters = Object.assign({}, copy.$filters, {
			"|": function (val, what) {
				what.expr.filters.length = 0;
				return null;
			}
		});
		this.firstElementChild.content.fuse({}, copy);

		this.update();
	}
	setup(state) {
		if (this.container.children.length == 0) this.addItem();
	}
	addItem(item) {
		const tpl = this.firstElementChild.content;
		const sel = this.getAttribute('selector');
		let sub;
		if (sel) {
			sub = tpl.querySelector(sel);
			if (sub) sub = sub.firstElementChild;
		}
		if (!sub) sub = tpl;
		this.container.insertBefore(
			sub.cloneNode(true),
			item && item.nextElementSibling || null
		);
		this.update();
	}
	delItem(item) {
		item.remove();
		if (this.container.children.length == 0) this.addItem();
		this.update();
	}
	handleClick(e) {
		const btn = e.target.closest('button[type="button"][name]');
		if (!btn) return;
		if (["add", "del"].includes(btn.name) == false) return;
		const cont = this.container;
		let child = e.target;
		while (child.parentNode != cont) {
			child = child.parentNode;
		}
		if (btn.name == "add") {
			this.addItem(child);
		} else if (btn.name == "del" && child) {
			this.delItem(child);
		}
	}
	get container() {
		const view = this.lastElementChild;
		const sel = this.getAttribute('selector');
		return sel && view.querySelector(sel) || view;
	}
}

Page.init((state) => {
	if (state.scope.$write) return;
	VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);
});


