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

class HTMLElementFieldsetList extends Page.Element {
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
		const splits = Array.from(keys).map(name => this.#parts(name));
		const prefix = [];
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
			prefix.push(com);
			com = null;
			pos++;
		}
		this.#prefix = prefix;
		const model = {};
		for (const key of keys) {
			if (this.#prefixed(key)) {
				model[this.#parts(key).slice(prefix.length).join('.')] = null;
			}
		}
		this.#model = model;
	}

	#prepare(scope) {
		const tpl = this.ownTpl;
		tpl.prerender();
		if (scope.$write) {
			this.#modelize(tpl);
			return;
		}
		this.#modelize(tpl.content);
		for (const node of tpl.content.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}
	}

	patch({ scope }) {
		this.#prepare(scope);
		if (!this.#size) this.#resize(0, scope);
	}

	setup({ scope }) {
		this.#prepare(scope);
	}

	#selector(name) {
		return `[block-type="fieldlist_button"][value="${name}"]`;
	}

	#prefixed(key, p = this.#prefix) {
		const parts = this.#parts(key);
		for (let i = 0; i < p.length; i++) {
			if (parts[i] != p[i]) return false;
		}
		return true;
	}

	#incrementkey(index, name) {
		if (!this.#prefixed(name)) return null;
		const parts = this.#prefix.slice();
		parts.push(index);
		parts.push(...this.#parts(name).slice(this.#prefix.length));
		return parts.join('.');
	}

	#resize(size, scope) {
		if (scope.$write) return;
		const len = Math.max(Number(this.dataset.size) || 0, size);
		if (this.#size === len) return;
		this.#size = len;
		let tpl = this.ownTpl.content.cloneNode(true);
		const fieldlist = Array.from(Array(len)).map((x, i) => {
			return { index: i };
		});
		const inputs = tpl.querySelectorAll('[name]');
		for (const node of inputs) {
			const name = this.#incrementkey('[fielditem.index]', node.name);
			if (name != null) {
				node.name = name;
			}
		}
		const conditionalFieldsets = tpl.querySelectorAll('[is="element-fieldset"]');
		for (const node of conditionalFieldsets) {
			const name = this.#incrementkey('[fielditem.index]', node.dataset.name);
			if (name != null) {
				node.dataset.name = name;
			}
		}

		const subtpl = inputs.ancestor();
		if (!subtpl) {
			console.warn("fieldset-list should contain input[name]", this);
			return;
		}
		subtpl.appendChild(
			subtpl.ownerDocument.createTextNode('[fieldlist|at:*|repeat:fielditem|]')
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
				hidden.name = this.#prefix.join('.');
				tpl.appendChild(hidden);
			}
		}
		tpl = tpl.fuse({ fieldlist }, scope);

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

	#parts(key) {
		return key ? key.split(".") : [];
	}

	#listFromValues(values) {
		const list = [];
		// just unflatten the array
		for (const [key, val] of Object.entries(values)) {
			if (!this.#prefixed(key)) continue;
			const parts = this.#parts(key).slice(this.#prefix.length);
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
		for (let i = 0; i < list.length; i++) {
			const obj = list[i];
			for (const [key, val] of Object.entries(obj)) {
				const parts = this.#prefix.slice();
				parts.push(i);
				parts.push(...this.#parts(key));
				values[parts.join('.')] = val;
			}
		}
	}

	handleClick(e, state) {
		if (state.scope.$write) return;
		const btn = e.target.closest('button');
		if (!btn) return;
		const action = btn.value;
		if (["add", "del", "up", "down"].includes(action) == false) return;

		const form = this.closest('form');
		const values = form.read(true);
		const list = this.#listFromValues(values);

		if (!this.#walk) this.#walk = new WalkIndex(this, node => {
			const { index } = this.#parseName(node.name);
			if (index >= 0 && index < list.length) return index;
			else return null;
		});
		let index;

		const fileInputs = this.querySelectorAll('[name][type="file"]')
			.map(n => n.cloneNode(true));

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
		const liveFileInputs = this.querySelectorAll('[name][type="file"]');
		for (const node of fileInputs) {
			const { value } = node;
			const { sub } = this.#parseName(node.name);
			const live = liveFileInputs.find(node => node.value == value);
			if (!live) continue;
			if (this.#parseName(live.name).sub === sub) {
				node.name = live.name;
				live.replaceWith(node);
			}
		}
	}

	#parseName(name) {
		if (!this.#prefixed(name)) {
			return { index: -1 };
		}
		const parts = this.#parts(name).slice(this.#prefix.length);
		const index = Number(parts.shift());
		if (!Number.isInteger(index)) return { index: -1 };
		return { index, sub: parts.join('.') };
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

Page.define('element-fieldset-list', HTMLElementFieldsetList);
