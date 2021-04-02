class HTMLElementFieldsetList extends VirtualHTMLElement {
	update() {
		let prefix = this.getAttribute('prefix');
		if (prefix) prefix += ".";
		else prefix = "";
		this.children.forEach((node, i) => {
			node.querySelectorAll('[name]').forEach(function (node) {
				if (node.type == "button" || !node.name) return;
				if (!node.dataset.name) node.dataset.name = node.name;
				node.name = `${prefix}${i}.${node.dataset.name}`;
			});
		});
	}
	build(state) {
		if (state.scope.$write) return;
		const tpl = this.firstElementChild;
		tpl.remove();
		const node = this;
		tpl.removeAttribute('block-content');
		const prefix = node.getAttribute('prefix');
		let data = {};
		if (prefix) {
			let iter = data;
			prefix.split('.').forEach((key, i, list) => {
				if (i < list.length - 1) iter = iter[key] = {};
				else iter[key] = [{}];
			});
		} else {
			data = [];
		}
		tpl.fuse(data, state.scope);
		node.dataset.html = tpl.outerHTML;
	}
	patch(state) {
		this.update();
	}
	setup(state) {
		if (this.children.length == 0) this.addItem();
	}
	addItem(item) {
		this.insertBefore(this.template, item && item.nextElementSibling || null);
		this.update();
	}
	delItem(item) {
		item.remove();
		if (this.children.length == 0) this.addItem();
		this.update();
	}
	handleClick(e) {
		const btn = e.target.closest('button[type="button"][name]');
		if (!btn) return;
		if (["add", "del"].includes(btn.name) == false) return;
		const item = this.children.find(item => item.contains(btn));
		if (btn.name == "add") {
			this.addItem(item);
		} else if (btn.name == "del" && item) {
			this.delItem(item);
		}
	}
	get template() {
		return this.dom(this.dataset.html);
	}
}

Page.init(function (state) {
	if (!state.scope.$write) {
		VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);
	}
});
