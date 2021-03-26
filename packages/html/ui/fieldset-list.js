class HTMLElementFieldsetList extends VirtualHTMLElement {
	update() {
		let prefix = this.getAttribute('prefix');
		if (prefix) prefix += ".";
		else prefix = "";
		this.children.forEach((node, i) => {
			node.querySelectorAll('[name]').forEach(function (node) {
				if (node.name && !node.name.startsWith(prefix)) {
					node.name = `${prefix}${i}.${node.name}`;
				}
			});
		});
	}
	patch(state) {
		this.update();
	}
	handleClick(e) {
		if (e.target.parentNode != this) return;
		switch (e.target.dataset.action) {
		case "add":
			this.insertBefore(this.template, this.cursor);
			this.update();
			break;
		case "del":
			this.cursor.previousElementSibling && this.cursor.previousElementSibling.remove();
			break;
		}
	}
	get template() {
		return this.dom(this.dataset.html);
	}
	get cursor() {
		return this.lastElementChild.previousElementSibling; // supposed to be a button
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
