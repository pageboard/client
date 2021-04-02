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
		this.update();
	}
	handleClick(e) {
		const name = e.target.name;
		if (["add", "del"].includes(name) == false) return;
		const item = this.children.find(item => item.contains(e.target));
		if (name == "add") {
			this.addItem(item);
		} else if (name == "del" && item) {
			this.delItem(item);
		}
	}
	get template() {
		return this.dom(this.dataset.html);
	}
}

Page.init(function (state) {
	if (!state.scope.$write) {
		state.scope.$filters.fieldset_list = function (val, what) {
			const tpl = what.parent;
			const node = tpl.parentNode;
			tpl.removeAttribute('data-html');
			tpl.removeAttribute('block-content');
			const copy = tpl.cloneNode(true);
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
			copy.fuse(data, what.scope);
			node.dataset.html = copy.outerHTML;
			return null;
		};
		VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);
	}
});
