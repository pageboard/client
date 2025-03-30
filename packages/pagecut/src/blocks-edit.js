import BlocksView from './blocks-view.js';

export default class Blocks extends BlocksView {
	mutate(node, data) {
		let nodes = [], block, id;
		if (typeof node != "string") {
			id = node.getAttribute('block-id');
		} else {
			id = node;
		}
		if (id) {
			block = this.get(id);
			if (!block) throw new Error("mutate node but block not found: " + id);
		}
		if (!id) {
			block = {
				type: node.getAttribute('block-type'),
				data: data
			};
			nodes = [node];
		} else {
			block.data = { ...block.data, ...data };
			nodes = this.domQuery(id, { all: true });
		}
		const view = this.view;
		const tr = view.state.tr;
		for (const node of nodes) {
			view.utils.refreshTr(tr, node, block);
		}
		view.dispatch(tr);
	}

	setStandalone(block, val) {
		if (val == block.standalone) return;
		if (!val) {
			// force new id for this block and its descendants by id-plugin
			const copy = this.copy(block);
			copy.focused = block.focused;
			block = copy;
		}
		block.standalone = val;
		const nodes = this.domQuery(block.id, { all: true });
		const tr = this.view.state.tr;
		nodes.forEach(node => {
			this.view.utils.refreshTr(tr, node, block);
		});
		this.view.dispatch(tr);
	}

	create(type) {
		return this.view.element(type).create();
	}

	fromAttrs(attrs) {
		const block = {};
		for (const [name, att] of Object.entries(attrs)) {
			if (!name.startsWith("_")) {
				block[name] = att;
			}
		}
		if (attrs.data) block.data = JSON.parse(attrs.data);
		if (attrs.expr) block.expr = JSON.parse(attrs.expr);
		if (attrs.lock) block.lock = JSON.parse(attrs.lock);
		if (attrs.content) block.content = JSON.parse(attrs.content);

		if (attrs.standalone == "true") block.standalone = true;
		else delete block.standalone;
		return block;
	}

	toAttrs(block) {
		const attrs = {};
		if (!block) return attrs;
		if (block.type == null) console.warn("Missing type", block);
		if (block.id != null) attrs.id = block.id;
		if (block.type != null) attrs.type = block.type;
		if (block.data) attrs.data = JSON.stringify(block.data);
		if (block.expr) attrs.expr = JSON.stringify(block.expr);
		if (block.lock) attrs.lock = JSON.stringify(block.lock);
		if (block.focused) attrs.focused = block.focused;
		if (block.standalone) attrs.standalone = "true";
		const el = this.view.element(block.type);
		if (el.contents.attrs.length) {
			const obj = {};
			for (const item of el.contents.attrs) {
				obj[item.id] = block.content[item.id];
			}
			attrs.content = JSON.stringify(obj);
		}
		return attrs;
	}

	serializeTo(parent, el, ancestor, blocks, parentDef = {}) {
		if (!el || typeof el == "string") el = this.view.element(el.name ?? parent.type);

		/*
		1. parent is the direct parent
		2. ancestor is the parent to relate to
		3. virtual block does not relate to ancestor
		4. standalone is ancestor to all its descendants
		Result: a virtual block need to be descendant of a standalone block,
		or else serialization cannot tell to which ancestor it must relate to
		(especially for new blocks - existing blocks are already related)
		*/

		if (parent.virtual && !parent.standalone) {
			throw new Error("A virtual block must be standalone");
		}

		if (ancestor?.blocks && parent.id && parent.id != ancestor.id) {
			ancestor.blocks[parent.id] = parent;
		}

		if (parent.standalone) {
			ancestor = parent;
		}

		if (parent == ancestor && !parent.blocks) {
			parent.blocks = {};
		}

		let contents = parent.content;
		if (!contents) contents = parent.content = {};

		el.contents.each({ content: contents }, (content, def) => {
			if (!content) return;
			if (typeof content == "string") {
				el.contents.set(parent, def.id, content);
				return;
			}
			if (parent.standalone && Array.isArray(content)) {
				// this is set by nodeView.update
				content = content[0];
			}
			content = content.cloneNode(true);
			let node, div, id, type, block, parentNode, blockEl;
			const list = [];
			while ((node = content.querySelector('[block-type],[block-id]'))) {
				type = node.getAttribute('block-type');
				parentNode = node.parentNode;
				blockEl = this.view.element(type);
				id = node.getAttribute('block-id');
				if (id) {
					div = content.ownerDocument.createElement(node.nodeName);
					parentNode.replaceChild(div, node);
					block = this.store[id];
					if (!block) {
						// parentNode.removeChild(node);
						// console.warn("block", type, "not found", id, "while serializing");
					} else {
						let copy = blocks[id];
						if (!copy) {
							copy = blocks[id] = this.copy(block);
						}
						block = copy;
						if (blockEl) {
							if (blockEl.unmount) {
								blockEl.unmount(block, node, this.view);
							}
							Blocks.reassignContent(block, blockEl, node); // not sure why this is necessary
						} else {
							// these are not mounted, ignore them
						}
					}
				} else {
					block = { type };
					if (blockEl.parse) {
						block.data = blockEl.parse(node);
					}
					type = null;
					div = node;
					// inplace blocks are no longer supported
					div.removeAttribute('block-data');
					div.removeAttribute('block-text');
					div.removeAttribute('spellcheck');
					div.removeAttribute('block-type');
					div.removeAttribute('block-focused');
				}
				if (def.virtual) {
					block.virtual = parent.id;
				}
				if (!id || !block || this.serializeTo(block, blockEl, ancestor, blocks, def)) {
					if (id && !block) {
						parent.blocks[id] = { id: id, ignore: true };
					}
					if (block?.type == type) type = null;
					list.push({ node: div, id, type });
				} else {
					parentNode.removeChild(div);
					if (id) delete ancestor.blocks[id];
				}
			}
			for (const item of list) {
				if (item.id) item.node.setAttribute('block-id', item.id);
				if (item.type) {
					// can override block.type
					item.node.setAttribute('block-type', item.type);
				}
			}
			for (const hack of content.querySelectorAll('.ProseMirror-trailingBreak,.ProseMirror-separator')) hack.remove();
			el.contents.set(parent, def.id, this.view.utils.serializeHTML(content, true));
		});

		if (Object.keys(contents).length == 0) delete parent.content;

		if (el.inline && !el.leaf) {
			if (!el.contents.get(parent)) return; // TODO find the meaning of this
		}
		return parent;
	}

	static reassignContent(block, elt, dom) {
		if (!block.content && !elt.leaf) {
			if (!block.standalone) {
				console.warn("block without content", block, dom);
			}
			return;
		}
		elt.contents.each(block, (content, def) => {
			if (!def.id || def.id == dom.getAttribute('block-content') || elt.inline) {
				elt.contents.set(block, def.id, dom);
			} else {
				const node = dom.querySelector(`[block-content="${def.id}"]`);
				if (node?.closest('[block-id]') == dom) {
					elt.contents.set(block, def.id, node);
				} else {
					console.error(`block.content[${def.id}] not found`, block, dom);
				}
			}
		});
		for (const attr of elt.contents.attrs ?? []) {
			const name = attr.name ?? attr.id;
			if (dom.hasAttribute(name)) {
				if (!block.content) block.content = {};
				block.content[attr.id] = dom.getAttribute(name);
			}
		}
	}

	to() {
		const view = this.view;
		const id = view.dom.getAttribute('block-id');
		const contentName = view.dom.getAttribute("block-content");
		const copies = {};
		const copy = this.copy(this.store[id]);
		copies[id] = copy;
		const el = view.element(copy.type);
		if (contentName) el.contents.set(copy, contentName, view.utils.getDom());
		return this.serializeTo(copy, view.dom.getAttribute('block-type'), null, copies);
	}


	clear(id) {
		if (id === undefined) {
			this.store = {};
		} else if (id == null || id == false) {
			console.warn('id.clear expects undefined or something not null');
		} else if (!this.store[id]) {
			console.warn('id.clear expects blocks to contain id', id);
		} else {
			delete this.store[id];
		}
	}

	get(id) {
		if (id == null) return;
		if (typeof id != "string" && id.getAttribute) {
			id = id.getAttribute('block-id');
			if (!id) throw new Error("Node without block-id attribute");
		}
		return this.store[id];
	}

	find(types) {
		return Object.values(this.store)
			.filter(block => types.includes(block.type));
	}

	set(data) {
		if (!Array.isArray(data)) data = [data];
		for (let i = 0, cur; i < data.length; i++) {
			cur = data[i];
			if (cur.id == null) {
				cur.id = this.genId();
			}
			this.store[cur.id] = cur;
		}
		return data;
	}

	genId(len) {
		if (!len) len = 8;
		// weak and simple unique id generator
		return String(Date.now() * Math.round(Math.random() * 1e4)).substring(0, len);
	}

	domQuery(id, opts) {
		if (!opts) opts = {};
		const rootDom = this.view.dom;
		let sel;
		if (id) {
			sel = `[block-id="${id}"]`;
		} else {
			sel = '';
		}
		if (opts.focused) {
			if (typeof opts.focused == "string") {
				sel += `[block-focused="${opts.focused}"]`;
			} else {
				sel += '[block-focused]';
			}
		} else if (!id) {
			throw new Error("domQuery expects at least id or opts.focused to be set " + id);
		}
		const nodes = Array.from(rootDom.querySelectorAll(sel));
		if (rootDom.getAttribute('block-id') == id) {
			// root is always focused, but another node having actual focus and representing
			// the current page could take precedence
			nodes.push(rootDom);
		}
		if (opts.all) return nodes;
		if (nodes.length == 0) return;
		const node = nodes[0];

		if (opts.content) {
			if (node.getAttribute('block-content') == opts.content) {
				return node;
			} else {
				return node.querySelector(`[block-content="${opts.content}"]`);
			}
		} else {
			return node;
		}
	}

	domSelect(node) {
		const { view } = this;
		view.focus();
		const { tr } = view.state;
		const sel = view.utils.selectDomTr(tr, node);
		view.dispatch(tr.setSelection(sel));
	}
}
