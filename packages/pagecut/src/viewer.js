import BlocksView from './blocks-view';
import Element from './element';

export default class Viewer {
	static Blocks = BlocksView;

	constructor(opts) {
		this.init(opts);
	}

	init(opts) {
		if (!opts) opts = {};
		this.blocks = new Viewer.Blocks(this, opts);

		this.doc = opts.document || document.cloneNode();
		const elts = this.elements = opts.elements ?? {};
		for (const [name, el] of Object.entries(elts)) {
			el.name = name;
			this.setElement(el);
		}
	}

	from(block, blocks, opts) {
		if (!opts) opts = {};
		if (opts.scope) this.scope = opts.scope;
		else opts.scope = this.scope;
		return this.blocks.from(block, blocks, opts);
	}

	element(type) {
		if (!type) return;

		let el = typeof type == "string" ? this.elements[type] : type;
		if (!el) return;
		if (!(el instanceof Element)) el = new Element(el);
		return el;
	}

	setElement(el) {
		if (!el.name) throw new Error("Element must have a name");
		this.elements[el.name] = new Element(el);
	}

	render(block, opts = {}) {
		let dom;
		const el = this.element(opts.element || opts.type || block.type);
		try {
			dom = this.blocks.render(el, block, opts);
		} catch (ex) {
			console.error(ex);
		}
		if (!dom) return;
		if (dom.nodeName == "HTML") {
			// documentElement is not editable
			if (this.doc.documentElement) {
				this.doc.removeChild(this.doc.documentElement);
			}
			this.doc.appendChild(dom);
			dom = dom.querySelector('body');
			if (!dom) {
				console.error(`${block.type} returns a document element but does not contain a body`);
			}
		}
		if (!dom || dom.nodeType != Node.ELEMENT_NODE) return dom;

		if (["BR", "HR", "WBR"].includes(dom.nodeName) == false) {
			dom.setAttribute('block-type', el.name);
		}

		if (opts.strip) return dom;
		if (!el.inplace) {
			if (block.id == null && this.blocks.set && opts.genId !== false) this.blocks.set(block);
			if (block.id != null) dom.setAttribute('block-id', block.id);
			else dom.removeAttribute('block-id');
		} else {
			dom.removeAttribute('block-id');
			const data = { ...block.data };
			if (el.properties) for (const key of Object.keys(el.properties)) {
				const attr = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
				if (dom.getAttribute(attr) == data[key]) delete data[key];
			}
			if (data && Object.keys(data).length && !el.parse) {
				dom.setAttribute('block-data', JSON.stringify(data));
			} else {
				dom.removeAttribute('block-data');
			}
		}
		const focus = block.focused;
		if (focus) {
			dom.setAttribute('block-focused', focus);
			if (focus == "last") dom.setAttribute('spellcheck', 'true');
		} else {
			dom.removeAttribute('block-focused');
		}

		return dom;
	}
}
