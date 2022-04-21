class HTMLElementFieldsetList extends VirtualHTMLElement {
	#size;
	#prefix;
	#model;

	fill(values, scope) {
		const list = this.listFromValues(Object.assign({}, values));
		this.resize(list.length, scope);
	}

	#prepare() {
		this.ownTpl.prerender();
		if (this.isContentEditable) return;
		for (const node of this.ownTpl.content.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}
		const keys = new Set();
		for (const node of this.ownTpl.content.querySelectorAll('[name]:not(button)')) {
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
		if (!this.#size) this.resize(0, state.scope);
	}

	setup() {
		this.#prepare();
	}

	resize(size, scope) {
		const len = Math.max(Number(this.dataset.size) || 0, size);
		if (this.#size === len) return;
		this.#size = len;
		let tpl = this.ownTpl.content.cloneNode(true);
		const $fieldset = { count: len };
		const nodes = [];
		const anc = tpl.querySelectorAll('[name]:not(button[name="add"])').ancestor();
		if (anc) {
			for (let i = 0; i < len; i++) {
				const clone = this.updateAncestor(anc.cloneNode(true), i);
				$fieldset.index = i + 1;
				clone.fuse({ $fieldset }, scope);
				nodes.push(clone);
			}
		} else {
			// TODO add a warning to the view (missing inputs/buttons)
		}
		if (len == 0) {
			let node = tpl.querySelector('button[type="button"][name="add"]');
			if (node) {
				while (node != tpl) {
					while (node.nextSibling) node.nextSibling.remove();
					while (node.previousSibling) node.previousSibling.remove();
					node = node.parentNode;
				}
				nodes.push(tpl.firstElementChild);
			}
		}
		if (tpl != anc) {
			// need to fuse tpl
			$fieldset.index = null;
			tpl.fuse({ $fieldset }, scope);
			for (const node of nodes) {
				anc.before(node);
			}
			if (anc) anc.remove();
		} else {
			tpl = tpl.cloneNode();
			for (const node of nodes) {
				tpl.appendChild(node);
			}
		}

		this.querySelectorAll('button[type="button"][name="up"]').forEach((node, i) => {
			node.disabled = i == 0;
		});
		this.querySelectorAll('button[type="button"][name="down"]').forEach((node, i, arr) => {
			node.disabled = i == arr.length - 1;
		});

		const view = this.ownView;
		view.textContent = '';
		view.appendChild(tpl);
	}

	updateAncestor(node, i) {
		const prefix = this.#prefix;
		for (const child of node.querySelectorAll('[name]:not(button)')) {
			if (child.name.startsWith(prefix)) {
				child.name = `${prefix}${i}.${child.name.substring(prefix.length)}`;
			}
		}
		return node;
	}

	listFromValues(values) {
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

	listToValues(values, list) {
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
		const btn = e.target.closest('button[type="button"][name]');
		if (!btn) return;
		if (["add", "del", "up", "down"].includes(btn.name) == false) return;

		const form = this.closest('form');
		const values = form.read(true);
		const list = this.listFromValues(values);
		let index;
		if (btn.value !== "") {
			index = Number(btn.value);
			if (!Number.isInteger(index) || index < 0 || index > list.length) {
				throw new Error(`fieldset-list expects ${btn.outerHTML} to have a value with a valid index`);
			}
			index += -1;
		} else {
			index = this.ownView.querySelectorAll(
				`button[type="button"][name="${btn.name}"]`
			).indexOf(btn);
			if (index < 0) index = list.length;
		}

		if (btn.name == "add") {
			list.splice(index + 1, 0, this.#model);
		} else if (btn.name == "del") {
			list.splice(index, 1);
		} else if (btn.name == "up") {
			if (index > 0) {
				list.splice(index - 1, 0, list.splice(index, 1).pop());
			}
		} else if (btn.name == "down") {
			if (index < list.length - 1) {
				list.splice(index + 1, 0, list.splice(index, 1).pop());
			}
		}
		this.listToValues(values, list);
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



