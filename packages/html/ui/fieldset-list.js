class WalkIndex {
	#walk;
	#find;
	#index;
	constructor(root, fn) {
		this.#find = fn;
		this.#walk = root.ownerDocument.createTreeWalker(
			root,
			NodeFilter.SHOW_ELEMENT,
			this
		);
	}
	acceptNode(node) {
		const index = this.#find(node);
		if (index != null) {
			this.#index = index;
			return NodeFilter.FILTER_ACCEPT;
		} else {
			return NodeFilter.FILTER_SKIP;
		}
	}
	findBefore(node) {
		this.#index = null;
		this.#walk.currentNode = node;
		this.#walk.previousNode();
		return this.#index;
	}
}

class HTMLElementFieldsetList extends VirtualHTMLElement {
	#size;
	#initialSize;
	#prefix;
	#model;
	#walk;

	fill(values, scope) {
		const list = this.#listFromValues({ ...values });
		if (this.#initialSize == null) this.#initialSize = list.length;
		this.#resize(list.length, scope);
	}

	reset() {
		this.#resize(this.#initialSize, {}); // missing scope
	}

	save() {
		this.#initialSize = this.#size;
	}

	#modelize(tpl) {
		const keys = new Set();
		const inputs = tpl.querySelectorAll('[name]');
		for (const node of inputs) {
			keys.add(node.name);
		}
		const splits = Array.from(keys).map(name => name.split('.'));
		const coms = [];
		let pos = 0, com = null;
		while (splits.length && splits.every(list => {
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

	#prepare() {
		const tpl = this.ownTpl;
		tpl.prerender();
		if (this.isContentEditable) {
			this.#modelize(tpl);
			return;
		}
		this.#modelize(tpl.content);
		for (const node of tpl.content.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}
	}

	patch(state) {
		this.#prepare();
		if (!this.#size) this.#resize(0, state.scope);
	}

	setup() {
		this.#prepare();
	}

	#selector(name) {
		return `[block-type="fieldlist_button"][value="${name}"]`;
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
				if (node.id?.startsWith('for-' + prefix)) {
					node.id = `for-${prefix}[$field.index].${node.id.substring(4 + prefix.length)}`;
				}
			}
		}
		const conditionalFieldsets = tpl.querySelectorAll('[is="element-fieldset"]');
		for (const node of conditionalFieldsets) {
			if (node.dataset.name?.startsWith(prefix)) {
				node.dataset.name = `${prefix}[$field.index].${node.dataset.name.substring(prefix.length)}`;
			}
		}
		const labels = tpl.querySelectorAll('label[for]');
		for (const node of labels) {
			if (node.htmlFor?.startsWith('for-' + prefix)) {
				node.htmlFor = `for-${prefix}[$field.index].${node.htmlFor.substring(4 + prefix.length)}`;
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
			let node = tpl.querySelector(this.#selector('add'));
			while (node != null && node != tpl && node != subtpl) {
				while (node.nextSibling) node.nextSibling.remove();
				while (node.previousSibling) node.previousSibling.remove();
				node = node.parentNode;
			}
			{
				const hidden = tpl.ownerDocument.createElement('input');
				hidden.type = "hidden";
				hidden.name = prefix.slice(0, -1);
				tpl.appendChild(hidden);
			}
		}
		tpl = tpl.fuse({ $fieldset }, scope);

		const view = this.ownView;
		view.textContent = '';
		view.appendChild(tpl);

		view.querySelectorAll(this.#selector('up')).forEach((node, i) => {
			node.disabled = i == 0;
		});
		view.querySelectorAll(this.#selector('down')).forEach((node, i, arr) => {
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
		if (!this.#walk) this.#walk = new WalkIndex(this, (node) => {
			if (node.name?.startsWith(prefix)) {
				const index = Number(node.name.substring(prefix.length).split('.').shift());
				if (Number.isInteger(index) || index >= 0 || index < list.length) {
					return index;
				}
			}
			return null;
		});
		let index;

		switch (action) {
			case "add":
				list.splice((this.#walk.findBefore(btn) ?? -1) + 1, 0, this.#model);
				break;
			case "del":
				list.splice(this.#walk.findBefore(btn) ?? 0, 1);
				break;
			case "up":
				index = this.querySelectorAll(this.#selector('up')).indexOf(btn);
				if (index > 0) {
					list.splice(index - 1, 0, list.splice(index, 1).pop());
				}
				break;
			case "down":
				index = this.querySelectorAll(this.#selector('down')).indexOf(btn);
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
	get prefix() {
		return this.#prefix;
	}
}

VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);
