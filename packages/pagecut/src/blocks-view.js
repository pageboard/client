module.exports = Blocks;

const str2dom = require('./str2dom');

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

function Blocks(view, opts) {
	this.view = view;
	this.initial = {};
	this.store = opts.store || {};
	if (opts.genId) this.genId = opts.genId;
}

Blocks.prototype.render = function(el, block, opts) {
	if (!opts) opts = {};
	var scope = opts.scope || this.view.scope || {};
	if (!scope.$doc) scope.$doc = this.view.doc;
	if (!scope.$elements) scope.$elements = this.view.elements;
	if (!scope.$element) scope.$element = el;

	block = Object.assign({}, block);
	block.data = Blocks.fill(el, block.data);
	var dom = el.render.call(el, block, scope);
	if (dom && opts.merge !== false) this.merge(el, dom, block);
	return dom;
};

Blocks.prototype.mount = function(el, block, blocks) {
	if (!el) return;
	el.contents.normalize(block);
	var copy = this.copy(block);
	var doc = this.view.doc;

	el.contents.each(block, function(content, def) {
		if (!(content instanceof Node)) {
			el.contents.set(copy, def.id, htmlToFrag(content, {doc: doc, ns: el.ns}));
		}
	});
	if (el.mount) {
		console.warn("deprecated el.mount", el.name);
		el.mount(copy, blocks);
	}
	return copy;
};

Blocks.fill = function(schema, data) {
	if (!schema.properties) return data;
	// sometimes data can carry an old odd value
	if (data === undefined || typeof data == "string") data = {};
	else data = Object.assign({}, data);
	Object.keys(schema.properties).forEach(function(key) {
		var prop = schema.properties[key];
		if (prop.default !== undefined && data[key] === undefined) data[key] = prop.default;
		if (prop.properties) data[key] = Blocks.fill(prop, data[key]);
	});
	return data;
};

Blocks.prototype.copy = function(block) {
	var copy = Object.assign({}, block);
	copy.data = Object.assign({}, block.data);
	if (block.expr) copy.expr = Object.assign({}, block.expr);
	if (block.lock) copy.lock = Object.assign({}, block.lock);
	if (block.content) copy.content = Object.assign({}, block.content);
	delete copy.focused;
	return copy;
};

Blocks.prototype.merge = function(el, dom, block) {
	if (dom.nodeType != Node.ELEMENT_NODE) return;
	el.contents.each(block, function(content, def) {
		if (!content) return;
		var node;
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
};

Blocks.prototype.from = function(block, blocks, opts) {
	this.rootId = block.id;
	if (!blocks) blocks = {};
	return this.renderFrom(block, blocks, this.store, opts);
};

Blocks.prototype.renderFrom = function(block, blocks, store, opts) {
	var view = this.view;
	if (!blocks) blocks = {};
	if (!opts) opts = {};
	var el = view.element(opts.element || opts.type || block.type);
	if (block.id) {
		this.initial[block.id] = block;
	}
	block = this.mount(el, block, blocks);
	if (!block) return;
	if (block.id) {
		// overwrite can happen when (re)loading virtual blocks
		var oldBlock = store[block.id];
		if (!oldBlock || oldBlock.type == block.type) store[block.id] = block;
	}
	var fragment;
	try {
		fragment = view.render(block, opts);
	} catch(ex) {
		console.error(ex);
	}
	if (block.children) {
		block.children.forEach(function(child) {
			if (!blocks[child.id]) {
				blocks[child.id] = child;
			} else {
				console.warn("child already exists", child, "in", block);
			}
		});
		delete block.children;
	}
	// if (block.blocks) {
	// 	Object.assign(blocks, block.blocks);
	// }
	if (!fragment || !fragment.querySelectorAll) return;

	var fragments = [fragment.nodeName == "BODY" ? fragment.parentNode : fragment];
	Array.prototype.forEach.call(fragment.querySelectorAll('template'), (node) => {
		fragments.push(node.content);
	});
	fragments.forEach((fragment) => {
		if (opts.strip) Array.prototype.forEach.call(fragment.querySelectorAll('[block-data]'), (node) => {
			node.removeAttribute('block-data');
		});
		Array.prototype.forEach.call(fragment.querySelectorAll('[block-id]'), (node) => {
			var id = node.getAttribute('block-id');
			if (id === block.id) return;
			var type = node.getAttribute('block-type');
			var parent = node.parentNode;
			var child = blocks[id];

			if (!child) {
				console.warn("missing block for", parent.nodeName, '>', node.nodeName, id);
				parent.replaceChild(node.ownerDocument.createTextNode('·'), node);
				return;
			}
			var frag = this.renderFrom(child, blocks, store, Object.assign({}, opts, {
				type: type,
				element: null
			}));
			if (!frag) {
				parent.removeChild(node);
				return;
			}
			if (frag.attributes) {
				for (var i = 0, att; i < node.attributes.length, att = node.attributes[i]; i++) {
					if (opts.strip && att.name == "block-id") continue;
					if (!frag.hasAttribute(att.name)) frag.setAttribute(att.name, att.value);
				}
			}
			parent.replaceChild(frag, node);
		});
	});
	return fragment;
};

