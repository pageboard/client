class HTMLElementFieldsetList extends VirtualHTMLElement {
	#size
	fill(values, scope) {
		const list = this.listFromValues(Object.assign({}, values));
		this.resize(list.length, scope);
	}

	patch(state) {
		this.ownTpl.prerender();
		if (this.isContentEditable) return;
		if (!this.#size) this.resize(0, state.scope);
	}

	setup(state) {
		this.ownTpl.prerender();
	}

	resize(size, scope) {
		const len = Math.max(Number(this.dataset.size) || 0, size);
		if (this.#size == len) return;
		this.#size = len;

		const tpl = this.ownTpl.content.cloneNode(true);
		for (const node of tpl.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}
		const anc = tpl.querySelectorAll('[name]:not(button)').ancestor();

		for (let i = len - 1; i >= 1; i--) {
			const clone = this.updateAncestor(anc.cloneNode(true), i);
			clone.fuse({ $fieldset: { index: i } }, scope);
			anc.parentNode.insertBefore(clone, anc.nextSibling);
		}
		this.updateAncestor(anc, 0);
		anc.fuse({ $fieldset: { index: 0 } }, scope);
		tpl.fuse({ $fieldset: { count: len } }, scope);
		const view = this.ownView;
		view.textContent = '';
		view.appendChild(tpl);
	}

	updateAncestor(node, i) {
		const prefix = this.prefix;
		for (const child of node.querySelectorAll('[name]:not(button)')) {
			child.name = `${prefix}${i}.${child.name}`;
		}
		return node;
	}

	modelFromTemplate() {
		const obj = {};
		for (const node of this.ownTpl.content.querySelectorAll('[name]:not(button)')) {
			obj[node.name] = null;
		}
		return obj;
	}

	listFromValues(values) {
		const list = [];
		const prefix = this.prefix;
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
		const prefix = this.prefix;
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
		if (["add", "del"].includes(btn.name) == false) return;

		const form = this.closest('form');
		const values = form.read(true);
		const list = this.listFromValues(values);
		const index = Number(btn.value);
		if (!Number.isInteger(index) || index < 0 || index > list.length) {
			throw new Error(`fieldset-list expects ${btn.outerHTML} to have a value with a valid index`);
		}
		if (btn.name == "add") {
			list.splice(index + 1, 0, this.modelFromTemplate());
		} else if (btn.name == "del") {
			list.splice(index, 1);
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
	get prefix() {
		const prefix = this.dataset.prefix;
		if (prefix) return prefix + ".";
		else return "";
	}
}

VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);



