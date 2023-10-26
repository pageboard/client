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
	#list;
	#defaultList;
	#prefix;
	#model;
	#walk;

	fill(values) {
		if (this.isContentEditable || this.prefix == null) return;
		const vars = [];
		for (const [key, val] of Object.entries(values)) {
			if (!this.#prefixed(key)) continue;
			vars.push(key);
			if (Array.isArray(val)) {
				for (let i = 0; i < val.length; i++) {
					values[key + '.' + i] = val[i];
				}
				delete values[key];
			}
		}
		this.#list = this.#listFromValues({ ...values });
		if (this.#defaultList == null) this.save();
		this.#resize();
		return vars;
	}

	reset() {
		this.#list = this.#defaultList.slice();
		this.#refresh();
	}

	save() {
		this.#defaultList = this.#list.slice();
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

	#prepare() {
		const tpl = this.ownTpl;
		tpl.prerender();
		this.#modelize(tpl.content);
		for (const node of tpl.content.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}
	}

	patch({ scope }) {
		if (scope.$write) {
			this.#modelize(this.ownTpl);
		}
	}

	setup(state) {
		if (state.scope.$write) return;
		this.#prepare();
		if (this.#defaultList == null) {
			const values = this.form.read(true);
			this.#defaultList = this.#listFromValues({ ...values });
		}
	}

	#selector(name) {
		return `[block-type="fieldlist_button"][value="${name}"]`;
	}

	#prefixed(key, p = this.prefix) {
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

	#resize() {
		const len = Math.max(Number(this.dataset.size) || 0, this.#list.length);
		let tpl = this.ownTpl.content.cloneNode(true);

		const inputs = tpl.querySelectorAll('[name]');
		for (const node of inputs) {
			const name = this.#incrementkey('[field.$i]', node.name);
			if (name != null) {
				const id = node.id;
				if (id?.startsWith(`for-${node.name}`)) {
					node.id = id.replace(node.name, name);
				}
				if (node.nextElementSibling?.htmlFor == id) {
					node.nextElementSibling.htmlFor = node.id;
				}
				node.name = name;
			}
		}

		const conditionalFieldsets = tpl.querySelectorAll('[is="element-fieldset"]');
		for (const node of conditionalFieldsets) {
			const name = this.#incrementkey('[field.$i]', node.dataset.name);
			if (name != null) {
				node.dataset.name = name;
			}
		}

		let subtpl = inputs.map(node => node.closest('.fields') ?? node).ancestor();
		let level = parseInt(this.dataset.level) || 0;
		while (subtpl && level--) {
			subtpl = subtpl.parentNode;
		}
		if (!subtpl) {
			console.warn("fieldset-list should contain input[name]", this);
			return;
		}
		subtpl.appendChild(
			subtpl.ownerDocument.createTextNode('[$fields|at:*|repeat:field|const:]')
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
		} else while (this.#list.length < len) {
			this.#list.push({...this.#model});
		}
		tpl = tpl.fuse({ $fields: this.#list }, {
			$hooks: {
				before: {
					get(ctx, val, args) {
						const path = args[0];
						if (path[0] == "field") {
							args[0] = [path[0], path.slice(1).join('.')];
						}
					}
				}
			}
		});

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
		for (const [key, val] of Object.entries(values)) {
			if (!this.#prefixed(key)) continue;
			const parts = this.#parts(key).slice(this.#prefix.length);
			const index = Number(parts.shift());
			if (!Number.isInteger(index)) continue;
			delete values[key];
			let obj = list[index];
			if (!obj) list[index] = obj = {};
			obj[parts.join('.')] = val;
			obj.$i = index;
		}
		return list;
	}

	#listToValues(values, list) {
		for (let i = 0; i < list.length; i++) {
			const obj = list[i] ?? {};
			for (const [key, val] of Object.entries(obj)) {
				if (key == "$i") continue;
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
		const list = this.#list;
		if (!this.#walk) this.#walk = new WalkIndex(this, node => {
			const { index } = this.#parseName(node.name);
			if (index >= 0 && index < list.length) return index;
			else return null;
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
		this.#refresh();
		state.dispatch(this, 'change');
	}

	#refresh() {
		const form = this.closest('form');
		const values = form.read(true);
		for (const key of Object.keys(values)) {
			if (this.#prefixed(key)) delete values[key];
		}
		const fileInputs = this.querySelectorAll('[name][type="file"]')
			.map(n => n.cloneNode(true));
		this.#listToValues(values, this.#list);
		form.fill(values);

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
		if (this.#prefix == null) {
			this.#prepare();
		}
		return this.#prefix;
	}
}

Page.define('element-fieldset-list', HTMLElementFieldsetList);
