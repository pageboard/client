class HTMLElementFieldsetList extends Page.Element {
	#list;
	#defaultList;
	#prefix;
	#model;

	fill(values) {
		if (this.isContentEditable || this.prefix == null) return;
		for (const [key, val] of Object.entries(values)) {
			const parts = this.#prefixed(key);
			if (!parts) continue;
			if (parts.length == 1 && Number.isInteger(Number(parts[0])) && Array.isArray(val)) {
				console.warn("fielset-list should receive flat lists", key, val);
				for (let i = 0; i < val.length; i++) {
					values[key + '.' + i] = val[i];
				}
				delete values[key];
			}
		}
		this.#list = this.#listFromValues({ ...values });
		if (this.#defaultList == null) this.save();
		this.#resize();
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
			// because custom elements are not started in templates, do not use .name
			const name = node.getAttribute('name');
			keys.add(name);
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
			const keyParts = this.#prefixed(key);
			if (keyParts) {
				model[keyParts.join('.')] = undefined;
			}
		}
		this.#model = model;
	}

	prepare(editable) {
		const tpl = this.ownTpl;
		if (editable) {
			this.#modelize(tpl);
		} else {
			tpl.prerender();
			this.#modelize(tpl.content);
			for (const node of tpl.content.querySelectorAll('[block-id]')) {
				node.removeAttribute('block-id');
			}
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
		return parts.slice(p.length);
	}

	#incrementkey(index, name) {
		const nameParts = this.#prefixed(name);
		if (!nameParts) return null;
		const parts = this.#prefix.slice();
		parts.push(index);
		parts.push(...nameParts);
		return parts.join('.');
	}

	#resize() {
		let tpl = this.ownTpl.content.cloneNode(true);

		const inputs = tpl.querySelectorAll('[name]');
		for (const node of inputs) {
			const name = node.getAttribute('name');
			const iname = this.#incrementkey('[field.$i]', name);
			if (iname != null) {
				const id = node.id;
				if (id?.startsWith(`for-${name}`)) {
					node.id = id.replace(name, iname);
				}
				if (node.nextElementSibling?.htmlFor == id) {
					node.nextElementSibling.htmlFor = node.id;
				}
				node.setAttribute('name', iname);
			}
		}

		const conditionalFieldsets = tpl.querySelectorAll('[is="element-fieldset"]');
		for (const node of conditionalFieldsets) {
			const name = this.#incrementkey('[field.$i]', node.dataset.name);
			if (name != null) {
				node.dataset.name = name;
			}
		}

		const subtpl = inputs.map(node => node.closest('.fields') ?? node).ancestor();
		subtpl.appendChild(
			subtpl.ownerDocument.createTextNode(
				`[$fields|at:${this.dataset.at || '*'}|repeat:field|const:]`
			)
		);
		const min = Number(this.dataset.min) || 0;
		const max = Number(this.dataset.max) || Infinity;
		let list = this.#list;
		const placeholder = list.length == 0 && min == 0;
		if (list.length == 0) {
			list = [{...this.#model, $i: min == 0 ? -1 : 0}];
		}
		tpl = tpl.fuse({
			$fields: list,
			$pathname: Page.pathname,
			$query: Page.query
		}, {
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

		if (placeholder) {
			for (const node of view.querySelectorAll(`[name^="${this.#prefixStr}"]`)) {
				node.disabled = true;
			}
		}

		view.querySelectorAll(this.#selector('up')).forEach((node, i) => {
			node.disabled = i == 0;
		});
		view.querySelectorAll(this.#selector('down')).forEach((node, i, arr) => {
			node.disabled = i == arr.length - 1;
		});
		view.querySelectorAll(this.#selector('del')).forEach((node) => {
			node.disabled = this.#list.length <= min;
		});
		view.querySelectorAll(this.#selector('add')).forEach((node) => {
			node.disabled = this.#list.length >= max;
		});
	}

	#parts(key) {
		return key ? key.split(".") : [];
	}

	#listFromValues(values) {
		const list = [];
		for (const [key, val] of Object.entries(values)) {
			const parts = this.#prefixed(key);
			if (!parts) continue;
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

	#findIndex(btn) {
		let node = btn;
		const sel = `[name^="${this.#prefixStr}"]`;
		while ((node = node.parentNode)) {
			const input = Array.from(node.querySelectorAll(sel)).pop();
			if (!input) continue;
			const { index } = this.#parseName(input.name);
			if (index >= 0 && index < this.#list.length) return index;
		}
	}

	handleClick(e, state) {
		if (state.scope.$write) return;
		const btn = e.target.closest('button');
		if (!btn) return;
		const action = btn.value;
		if (["add", "del", "up", "down"].includes(action) == false) return;
		const list = this.#listFromValues(this.closest('form').read(true));
		let index;

		switch (action) {
			case "add":
				list.splice((this.#findIndex(btn) ?? -1) + 1, 0, { ...this.#model });
				break;
			case "del":
				list.splice(this.#findIndex(btn) ?? 0, 1);
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
		this.#list = list;
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
		const parts = this.#prefixed(name);
		if (!parts) {
			return { index: -1 };
		}
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
	get #prefixStr() {
		return this.#prefix.length ? this.#prefix.join('.') + '.' : '';
	}
}

Page.define('element-fieldset-list', HTMLElementFieldsetList);
