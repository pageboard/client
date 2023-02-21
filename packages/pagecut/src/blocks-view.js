import str2dom from './str2dom';

function htmlToFrag(str, {doc, ns}) {
	try {
		return str2dom(str, {
			doc: doc,
			frag: true,
			ns: ns
		});
	} catch(ex) {
		console.error(ex);
	}
}

export default class BlocksView {
	constructor(view, opts) {
		this.view = view;
		this.initial = {};
		this.store = opts.store ?? {};
		if (opts.genId) this.genId = opts.genId;
	}

	render(el, block, opts = {}) {
		const { scope = {} } = opts;
		if (!scope.$doc) scope.$doc = this.view.doc;
		if (!scope.$elements) scope.$elements = this.view.elements;
		if (!scope.$element) scope.$element = el;

		block = { ...block };
		block.data = BlocksView.fill(el, block.data);
		const dom = el.render(block, scope);
		if (dom && opts.merge !== false) this.merge(el, dom, block);
		return dom;
	}

	mount(el, block, blocks) {
		el.contents.normalize(block);
		const copy = this.copy(block);
		const doc = this.view.doc;

		el.contents.each(block, (content, def) => {
			if (!(content instanceof Node)) {
				el.contents.set(copy, def.id, htmlToFrag(content, { doc: doc, ns: el.ns }));
			}
		});
		if (el.mount) {
			console.warn("deprecated el.mount", el.name);
			el.mount(copy, blocks);
		}
		return copy;
	}

	static fill(schema, data) {
		if (!schema.properties) return data;
		// sometimes data can carry an old odd value
		if (data === undefined || typeof data == "string") data = {};
		else data = { ...data };
		for (const [key, prop] of Object.entries(schema.properties)) {
			if (prop.default !== undefined && data[key] === undefined) {
				data[key] = prop.default;
			}
			if (prop.properties) data[key] = BlocksView.fill(prop, data[key]);
		}
		return data;
	}

	copy(block) {
		const copy = { ...block };
		copy.data = { ...block.data };
		if (block.expr) copy.expr = { ...block.expr };
		if (block.lock) copy.lock = { ...block.lock };
		if (block.content) copy.content = { ...block.content };
		delete copy.focused;
		return copy;
	}

	merge(el, dom, block) {
		if (dom.nodeType != Node.ELEMENT_NODE) return;
		el.contents.each(block, (content, def) => {
			if (!content) return;
			let node;
			if (!def.id || def.id == dom.getAttribute('block-content') || el.inline) {
				node = dom;
			} else {
				node = dom.querySelector(`[block-content="${def.id}"]`);
			}
			if (!node) return;
			if (node.nodeName == "TEMPLATE") node = node.content;
			if (typeof content == "string") {
				content = node.ownerDocument.createTextNode(content);
			} else if (content.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
				content = node.ownerDocument.importNode(content, true);
			} else if (content.nodeType == Node.ELEMENT_NODE) {
				console.warn("already merged", content == node);
				return;
			} else {
				console.warn("cannot merge content", content);
				return;
			}
			node.textContent = "";
			node.appendChild(content);
		});
	}

	from(block, blocks, opts) {
		this.rootId = block.id;
		if (!blocks) blocks = {};
		return this.renderFrom(block, blocks, this.store, opts);
	}

	renderFrom(block, blocks = {}, store, opts = {}) {
		const { view } = this;
		const type = opts.element || opts.type || block.type;
		const el = view.element(type);
		if (block.id) {
			this.initial[block.id] = block;
		}
		if (!el) {
			console.warn("Unknown block type", block.id, type);
			return;
		}
		block = this.mount(el, block, blocks);
		if (!block) return;
		if (block.id) {
			// overwrite can happen when (re)loading virtual blocks
			const oldBlock = store[block.id];
			if (!oldBlock || oldBlock.type == block.type) store[block.id] = block;
		}
		let fragment;
		try {
			fragment = view.render(block, opts);
		} catch (ex) {
			console.error(ex);
		}
		if (block.children) {
			for (const child of block.children) {
				if (!blocks[child.id]) {
					blocks[child.id] = child;
				} else {
					console.warn("child already exists", child.id, child.type, "in", block.id, block.type);
				}
			}
			delete block.children;
		}
		// if (block.blocks) {
		// 	Object.assign(blocks, block.blocks);
		// }
		if (!fragment || !fragment.querySelectorAll) return;

		const fragments = [fragment.nodeName == "BODY" ? fragment.parentNode : fragment];
		for (const node of fragment.querySelectorAll('template')) {
			fragments.push(node.content);
		}
		for (const frag of fragments) {
			if (opts.strip) for (const node of frag.querySelectorAll('[block-data]')) {
				node.removeAttribute('block-data');
			}
			for (const node of frag.querySelectorAll('[block-id]')) {
				const id = node.getAttribute('block-id');
				if (id === block.id) continue;
				const type = node.getAttribute('block-type');
				const parent = node.parentNode;
				const child = blocks[id];

				if (!child) {
					if (store[id]) {
						continue;
					}
					console.warn("missing block for", parent.nodeName, '>', node.nodeName, id);
					// FIXME find another way
					//parent.replaceChild(node.ownerDocument.createTextNode('∅'), node);
					continue;
				}
				const frag = this.renderFrom(child, blocks, store, {
					...opts,
					type: type,
					element: null
				});
				if (!frag) {
					parent.removeChild(node);
					continue;
				}
				if (frag.attributes) {
					for (const att of node.attributes) {
						if (opts.strip && att.name == "block-id") continue;
						if (!frag.hasAttribute(att.name)) frag.setAttribute(att.name, att.value);
					}
				}
				parent.replaceChild(frag, node);
			}
		}
		return fragment;
	}
}
