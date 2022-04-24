class HTMLElementFieldsetList extends VirtualHTMLElement {
	#size;
	#prefix;
	#model;

	fill(values, scope) {
		const list = this.#listFromValues({ ...values });
		this.#resize(list.length, scope);
	}

	#prepare() {
		this.ownTpl.prerender();
		if (this.isContentEditable) return;
		for (const node of this.ownTpl.content.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}
		const keys = new Set();
		const inputs = this.ownTpl.content.querySelectorAll('[name]');
		for (const node of inputs) {
			keys.add(node.name);
		}
		const splits = Array.from(keys).map(name => name.split('.'));
		const coms = [];
		let pos = 0, com = null;
		while (splits.every(list => {
			if (com == null) {
				if (pos < list.length) {
					com = list[pos];
					return true;
				} else {
					return false;
				}
			} else {
				return list[pos] == com;
			}
		})) {
			coms.push(com);
			com = null;
			pos++;
		}
		if (coms.length) coms.push('');
		const prefix = coms.join('.');
		this.#prefix = prefix;
		const model = {};
		for (const key of keys) {
			if (key.startsWith(prefix)) model[key.substring(prefix.length)] = null;
		}
		this.#model = model;
	}

	patch(state) {
		this.#prepare();
		if (!this.#size) this.#resize(0, state.scope);
	}

	setup() {
		this.#prepare();
	}

	#resize(size, scope) {
		if (this.isContentEditable) return;
		const len = Math.max(Number(this.dataset.size) || 0, size);
		if (this.#size === len) return;
		this.#size = len;
		let tpl = this.ownTpl.content.cloneNode(true);
		const $fieldset = Array.from(Array(len)).map((x, i) => {
			return { index: i };
		});
		const inputs = tpl.querySelectorAll('[name]');
		const prefix = this.#prefix;
		for (const node of inputs) {
			if (node.name.startsWith(prefix)) {
				node.name = `${prefix}[$field.index].${node.name.substring(prefix.length)}`;
			}
		}
		const subtpl = inputs.ancestor();
		if (!subtpl) {
			console.warn("fieldset-list should contain input[name]", this);
			return;
		}
		subtpl.appendChild(
			subtpl.ownerDocument.createTextNode('[$fieldset|repeat:*:$field|]')
		);
		if (len == 0) {
			let node = tpl.querySelector('[block-type="fieldlist_button"][value="add"]');
			while (node != null && node != tpl && node != subtpl) {
				while (node.nextSibling) node.nextSibling.remove();
				while (node.previousSibling) node.previousSibling.remove();
				node = node.parentNode;
			}
		}
		tpl = tpl.fuse({ $fieldset }, scope);

		const view = this.ownView;
		view.textContent = '';
		view.appendChild(tpl);

		view.querySelectorAll('[block-type="fieldlist_button"][value="up"]').forEach((node, i) => {
			node.disabled = i == 0;
		});
		view.querySelectorAll('[block-type="fieldlist_button"][value="down"]').forEach((node, i, arr) => {
			node.disabled = i == arr.length - 1;
		});
	}

	#listFromValues(values) {
		const list = [];
		const prefix = this.#prefix;
		// just unflatten the array
		for (const [key, val] of Object.entries(values)) {
			if (!key.startsWith(prefix)) continue;
			const parts = key.slice(prefix.length).split(".");
			const index = Number(parts.shift());
			if (!Number.isInteger(index)) continue;
			delete values[key];
			let obj = list[index];
			if (!obj) list[index] = obj = {};
			obj[parts.join('.')] = val;
		}
		return list;
	}

	#listToValues(values, list) {
		const prefix = this.#prefix;
		for (let i = 0; i < list.length; i++) {
			const obj = list[i];
			for (const [key, val] of Object.entries(obj)) {
				values[`${prefix}${i}.${key}`] = val;
			}
		}
	}

	handleClick(e, state) {
		if (this.isContentEditable) return;
		const btn = e.target.closest('button');
		if (!btn) return;
		const action = btn.value;
		if (["add", "del", "up", "down"].includes(action) == false) return;

		const form = this.closest('form');
		const values = form.read(true);
		const list = this.#listFromValues(values);
		const prefix = this.#prefix;
		let index;
		const walk = this.ownerDocument
			.createTreeWalker(this, NodeFilter.SHOW_ELEMENT, {
				acceptNode(node) {
					if (node.name?.startsWith(prefix)) {
						index = Number(node.name.substring(prefix.length).split('.').shift());
						if (Number.isInteger(index) || index >= 0 || index < list.length) {
							return NodeFilter.FILTER_ACCEPT;
						} else {
							index = null;
						}
					}
					return NodeFilter.FILTER_SKIP;
				}
			});
		walk.currentNode = btn;
		walk.previousNode();
		if (!index) index = 0;

		switch (action) {
			case "add":
				list.splice(index + 1, 0, this.#model);
				break;
			case "del":
				list.splice(index, 1);
				break;
			case "up":
				if (index > 0) {
					list.splice(index - 1, 0, list.splice(index, 1).pop());
				}
				break;
			case "down":
				if (index < list.length - 1) {
					list.splice(index + 1, 0, list.splice(index, 1).pop());
				}
				break;
		}
		this.#listToValues(values, list);
		form.fill(values, state.scope);
	}

	get ownTpl() {
		return this.children.find(
			node => node.matches('template,script[type="text/html"]')
		);
	}
	get ownView() {
		return this.children.find(node => node.matches('.view'));
	}
}

VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);
