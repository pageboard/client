module.exports = Viewer;

const BlocksView = require('./blocks-view');
const Element = require('./element');

function Viewer(opts) {
	if (!opts) opts = {};
	this.blocks = new BlocksView(this, opts);

	this.doc = opts.document || document.cloneNode();
	var elts = this.elements = opts.elements || {};

	var el;
	for (var name in elts) {
		el = elts[name];
		el.name = name;
		this.setElement(el);
	}
}

Viewer.prototype.from = function(block, blocks, opts) {
	if (!opts) opts = {};
	if (opts.scope) this.scope = opts.scope;
	else opts.scope = this.scope;
	return this.blocks.from(block, blocks, opts);
};

Viewer.prototype.element = function(type) {
	if (!type) return;

	var el = typeof type == "string" ? this.elements[type] : type;
	if (!el) return;
	if (!(el instanceof Element)) el = new Element(el);
	return el;
};

Viewer.prototype.setElement = function(el) {
	if (!el.name) throw new Error("Element must have a name");
	this.elements[el.name] = new Element(el);
};

Viewer.prototype.render = function(block, opts) {
	var dom;
	opts = opts || {};
	var el = this.element(opts.element || opts.type || block.type);
	try {
		dom = this.blocks.render(el, block, opts);
	} catch(ex) {
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

	dom.setAttribute('block-type', el.name);
	if (block.expr && Object.keys(block.expr).length) {
		dom.setAttribute('block-expr', JSON.stringify(block.expr));
	} else {
		dom.removeAttribute('block-expr');
	}
	if (opts.strip) return dom;
	if (!el.inplace) {
		if (block.id == null && this.blocks.set && opts.genId !== false) this.blocks.set(block);
		if (block.id != null) dom.setAttribute('block-id', block.id);
		else dom.removeAttribute('block-id');
	} else {
		dom.removeAttribute('block-id');
		var data = Object.assign({}, block.data);
		if (el.properties) Object.keys(el.properties).forEach((key) => {
			var attr = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
			if (dom.getAttribute(attr) == data[key]) delete data[key];
		});
		if (data && Object.keys(data).length) {
			dom.setAttribute('block-data', JSON.stringify(data));
		} else {
			dom.removeAttribute('block-data');
		}
	}
	if (block.focused) dom.setAttribute('block-focused', block.focused);
	else dom.removeAttribute('block-focused');

	return dom;
};

