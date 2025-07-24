Pageboard.Controls.Breadcrumb = class Breadcrumb {
	constructor(editor, node) {
		this.node = node;
		this.editor = editor;

		if (!Breadcrumb.template) {
			Breadcrumb.template = this.node.lastElementChild;
			Breadcrumb.template.remove();
		}
		if (!Breadcrumb.help) {
			Breadcrumb.help = this.node.firstElementChild;
		}
		this.node.addEventListener('click', this);
	}

	destroy() {
		this.node.removeEventListener('click', this);
		this.node.textContent = '';
		this.node.appendChild(Breadcrumb.help.cloneNode(true));
	}

	update(parents, selection) {
		if (!this.parents) this.node.textContent = "";
		const elders = this.parents || [];
		this.parents = parents = parents.slice().reverse();
		let parent, elder, item, cut = false;
		const children = this.node.children;
		let i, j;
		for (i = 0, j = 0; i < parents.length; i++, j++) {
			parent = parents[i];
			elder = elders[j];
			if (!elder || parent.block.id !== elder.block.id || parent.block.id == null || parent.contentName && parent.contentName !== elder.contentName) {
				cut = true;
				item = this.item(parent);
				this.node.insertBefore(item, children[i]);
				if (children[i + 1]) children[i + 1].remove();
			} else {
				item = children[i];
			}
			if (item && item.children.length > 0) {
				item.dataset.focused = parent.node.attrs.focused;
				item.firstElementChild.classList.toggle('active', parent.node.attrs.focused == "last");
			}
		}

		if (!cut) for (j = i; j < elders.length; j++) {
			item = children[j];
			if (!item || item.children.length == 0) break;
			parents.push(elders[j]);
			if (!item.dataset.id) {
				cut = true;
				break;
			} else {
				item.dataset.focused = elders[j].node.attrs.focused;
				item.firstElementChild.classList.remove('active');
			}
		}
		if (cut) while (children[j]) children[j].remove();

		const last = this.node.lastElementChild;
		if (!cut && last.children.length && last.dataset.content != parents[i - 1].contentName) {
			delete last.dataset.content;
			while (last.firstElementChild?.nextSibling?.nodeType == Node.TEXT_NODE) {
				last.firstElementChild.nextSibling.remove();
			}
		}
		const lastIsText = last?.children?.length == 0;
		if (!selection.node && parents.length > 1) {
			if (!lastIsText && !last.dataset.content) {
				this.node.insertAdjacentHTML("beforeEnd", `<span>${parent.contentName || 'text'}</span>`);
			}
		} else if (lastIsText) {
			last.remove();
		}
	}

	item(parent) {
		const node = Breadcrumb.template.cloneNode(true);
		const item = node.querySelector('.section');
		const el = this.editor.element(parent.type);
		item.textContent = el.title;
		node.dataset.selector = `[block-type="${parent.type}"]`;
		if (parent.block.id) node.dataset.id = parent.block.id;
		const contentName = parent.contentName;
		if (contentName) {
			const def = el.contents.find(contentName);
			const title = def.title;
			if (title) {
				node.dataset.content = contentName;
				node.insertBefore(node.ownerDocument.createTextNode(title), node.lastElementChild);
			}
		}
		return node;
	}

	handleEvent(e) {
		if (e.type != "click") return;
		const editor = this.editor;
		const selectors = [];
		const items = Array.from(this.node.children);
		const target = e.target.closest('span');
		let subFocused = false;
		items.some((item, i) => {
			const id = item.dataset.id;
			let sel = item.dataset.selector || '';
			if (id) {
				sel += `[block-id="${id}"]`;
			} else {
				if (!subFocused && i > 0) sel += '[block-focused]';
				if (item.dataset.focused == "last") subFocused = true;
			}
			selectors.push(sel);
			return item === target;
		});
		const selector = selectors.join(' ');
		const node = editor.root.querySelector(selector);
		if (!node) {
			throw new Error(`No node found with selector ${selector}`);
		}
		const sel = editor.utils.select(node);
		if (sel) {
			editor.focus();
			editor.dispatch(editor.state.tr.setSelection(sel));
		}
	}
};

