const { DiffDOM } = require('diff-dom');

const differ = new DiffDOM({
	preDiffApply(info) {
		if (info.diff.action.endsWith("Attribute") && info.diff.name == "block-focused") {
			return true;
		}
	}
});

const innerDiff = new DiffDOM({
	filterOuterDiff(a, b, diffs) {
		if (a.attributes && a.attributes['block-content']) {
			a.innerDone = true;
		}
	},
	preDiffApply(info) {
		if (info.diff.action.endsWith("Attribute") && info.diff.name.startsWith("block-")) {
			return true;
		}
	}
});

Object.assign(exports, {
	flagDom, findContent, tryJSON, domAttrsMap, saveDomAttrs, staticHtml
});

exports.RootNodeView = class RootNodeView {
	constructor(node, view, getPos, decorations) {
		this.view = view;
		this.element = node.type.spec.element;
		this.domModel = node.type.spec.domModel;
		this.getPos = typeof getPos == "function" ? getPos : null;
		this.id = node.attrs.id;
		if (!this.id && node.type.name == view.state.doc.type.name) {
			this.id = node.attrs.id = view.dom.getAttribute('block-id');
		}

		let block;
		if (this.id) {
			if (this.element.inplace) {
				delete node.attrs.id;
				delete this.id;
			} else {
				block = view.blocks.get(this.id);
			}
		}
		if (!block) {
			if (node.attrs.id) {
				delete node.attrs.id;
				delete this.id;
			}
			block = view.blocks.fromAttrs(node.attrs);
		}
		if (!this.element.inplace && !this.id) {
			view.blocks.set(block);
			this.id = node.attrs.id = block.id;
		}

		if (block.focused) delete block.focused;

		setupView(this, node);
		this.update(node);
	}

	selectNode() {
		this.selected = true;
		this.dom.classList.add('ProseMirror-selectednode');
	}

	deselectNode() {
		this.selected = false;
		this.dom.classList.remove('ProseMirror-selectednode');
	}

	update(node, decorations) {
		if (this.element.name != node.attrs.type) {
			return false;
		}
		const oldBlock = this.oldBlock;
		// TODO update instances of other standalone blocks !
		if (node.attrs.id != this.id) {
			return false;
		}
		const view = this.view;
		const uBlock = view.blocks.fromAttrs(node.attrs);
		let block;
		if (this.element.inplace) {
			block = uBlock;
		} else {
			block = view.blocks.get(this.id);
			if (!block) {
				// eslint-disable-next-line no-console
				console.warn("block should exist", node);
				return true;
			}
		}
		if (uBlock.data) block.data = uBlock.data;
		if (uBlock.expr) block.expr = uBlock.expr;
		if (uBlock.lock) block.lock = uBlock.lock;

		// consider it's the same data when it's initializing
		let sameData = false;
		if (oldBlock) {
			sameData = view.utils.equal(oldBlock.data || {}, block.data || {});
			if (sameData && block.expr) {
				sameData = view.utils.equal(oldBlock.expr || {}, block.expr || {});
			}
		}
		const sameFocus =
			(oldBlock && oldBlock.focused || false) == (node.attrs.focused || false);

		if (!sameData || !sameFocus) {
			this.oldBlock = view.blocks.copy(block);
			this.oldBlock.focused = node.attrs.focused;

			if (node.attrs.focused) block.focused = node.attrs.focused;
			else delete block.focused;

			let dom = view.render(block, { type: node.attrs.type, merge: false });
			if (dom && dom.nodeType == Node.DOCUMENT_FRAGMENT_NODE && dom.children.length == 1) {
				dom = dom.children[0];
			}
			const tr = view.state.tr;
			mutateAttributes(this.dom, dom);
			if (!sameData) {
				const nobj = flagDom(this.element, dom);
				try {
					mutateNodeView(tr, this.getPos ? this.getPos() : null, node, this, nobj);
				} catch (ex) {
					return true;
				}
			}
			// pay attention to the risk of looping over and over
			if (oldBlock && this.getPos && tr.docChanged) {
				view.dispatch(tr);
			}
			if (view.explicit && !node.type.spec.wrapper && this.contentDOM && !this.element.inline) {
				this.contentDOM.setAttribute('element-content', 'true');
			}
			if (this.contentDOM && node.isTextblock) {
				this.contentDOM.setAttribute('block-text', 'true');
			}
			if (this.selected) {
				this.selectNode();
			}
		} else {
			// no point in calling render
		}

		const cname = node.type.spec.contentName;
		if (cname != null) {
			const cdom = this.contentDOM;
			if (!block.content) block.content = {};
			if (block.standalone && oldBlock) {
				if (!Array.isArray(block.content[cname])) {
					block.content[cname] = [];
				}
				let found = false;
				block.content[cname].forEach(function (idom) {
					if (idom == cdom) {
						found = true;
					} else {
						differ.apply(idom, differ.diff(idom, cdom));
					}
				});
				if (!found) {
					block.content[cname].push(cdom);
				}
			} else {
				if (block.content[cname] != cdom) {
					block.content[cname] = cdom;
				}
			}
		}
		return !(this.virtualContent && node.childCount == 0 && this.dom.isConnected);
	}

	ignoreMutation(record) {
		if (record.type == "attributes") {
			const dom = record.target;
			let obj = dom.pcUiAttrs;
			if (!obj) obj = dom.pcUiAttrs = {};
			const name = record.attributeName;
			const val = dom.getAttribute(name);
			if (name == "class") {
				if (record.oldValue != val) {
					const oldClass = mapOfClass(record.oldValue);
					const newClass = mapOfClass(val);
					const diffClass = {};
					for (const k in newClass) if (newClass[k] && !oldClass[k]) diffClass[k] = true;
					obj[name] = Object.keys(diffClass).join(' ');
				}
			} else if (name == "style") {
				if (record.oldValue != val) {
					const oldStyle = mapOfStyle(record.oldValue);
					const newStyle = mapOfStyle(dom.style);
					const diffStyle = [];
					for (const j in newStyle) if (newStyle[j] && !oldStyle[j]) diffStyle.push(j + ':' + newStyle[j] + ';');
					obj[name] = diffStyle.join('');
				}
			} else {
				obj[name] = val;
			}
			return true;
		} else if (record.type == "childList" && record.addedNodes.length > 0 && !Array.prototype.some.call(record.addedNodes, function (node) {
			if (node.nodeType != Node.ELEMENT_NODE) return true;
			return node.getAttribute('contenteditable') != "false";
		})) {
			return true;
		} else if (record.target == this.contentDOM && record.type == "childList") {
			return false;
		} else if (record.type != "selection") {
			return true;
		}
	}
};

exports.WrapNodeView = class WrapNodeView {
	constructor(node, view, getPos, decorations) {
		this.view = view;
		this.getPos = typeof getPos == "function" ? getPos : null;
		this.element = node.type.spec.element;
		this.domModel = node.type.spec.domModel;
		setupView(this, node);
		this.update(node);
	}

	update(node, decorations) {
		if (!this.id) {
			this.id = node.attrs._id;
		} else if (this.id != node.attrs._id) {
			return false;
		}
		restoreDomAttrs(tryJSON(node.attrs._json), this.dom);
		return true;
	}

	ignoreMutation(record) {
		// always ignore mutation
		if (record.type != "selection") return true;
	}
};

exports.ConstNodeView = class ConstNodeView {
	constructor(node, view, getPos, decorations) {
		this.view = view;
		this.getPos = typeof getPos == "function" ? getPos : null;
		this.element = node.type.spec.element;
		this.domModel = node.type.spec.domModel;
		setupView(this, node);
		this.dom.setAttribute("contenteditable", "false");
		this.update(node);
	}

	update(node, decorations) {
		if (!this.id) {
			this.id = node.attrs._id;
		} else if (this.id != node.attrs._id) {
			return false;
		}
		restoreDomAttrs(tryJSON(node.attrs._json), this.dom);
		if (this.view.explicit) {
			this.dom.innerHTML = '';
		} else {
			innerDiff.apply(this.dom, innerDiff.diff(this.dom, node.attrs._html));
		}
		return true;
	}

	ignoreMutation(record) {
		// always ignore mutation, even selection
		return true;
	}
};

exports.ContainerNodeView = class ContainerNodeView {
	constructor(node, view, getPos, decorations) {
		this.view = view;
		this.element = node.type.spec.element;
		this.domModel = node.type.spec.domModel;

		setupView(this, node);
		this.update(node);
	}

	update(node, decorations) {
		const contentName = node.type.spec.contentName;
		if (contentName != this.contentName) {
			return false;
		}
		restoreDomAttrs(tryJSON(node.attrs._json), this.dom);

		if (this.view.explicit) {
			this.contentDOM.setAttribute('element-content', 'true');
		} else if (node.attrs._html) {
			const diffs = innerDiff.diff(this.dom, node.attrs._html);
			innerDiff.apply(this.dom, diffs);
		}
		if (node.isTextblock) {
			this.contentDOM.setAttribute('block-text', 'true');
		}

		if (!this.id) this.id = node.attrs._id;
		else if (this.id != node.attrs._id) return false;

		const block = this.view.blocks.get(this.id);
		if (!block) {
			// eslint-disable-next-line no-console
			console.warn("container has no root node id", this, node);
			return false;
		}

		if (!block.content) block.content = {};
		if (block.content[contentName] != this.contentDOM) {
			block.content[contentName] = this.contentDOM;
		}
		return !(this.virtualContent && node.childCount == 0 && this.dom.isConnected);
	}

	ignoreMutation(record) {
		if (record.target == this.contentDOM && record.type == "childList") {
			return false;
		} else if (record.type != "selection") {
			return true;
		}
	}
};

/*
Nota Bene: nodes between obj.dom and obj.contentDOM (included) can be modified
by front-end. So when applying a new rendered DOM, one only wants to apply
diff between initial rendering and new rendering, leaving user modifications
untouched.
*/
function mutateNodeView(tr, pos, pmNode, obj, nobj) {
	const dom = obj.dom;
	const initial = !obj._pcinit;
	if (initial) obj._pcinit = true;
	if (dom && nobj.dom.nodeName != dom.nodeName) {
		const emptyDom = nobj.dom.cloneNode(false);
		const sameContentDOM = obj.contentDOM == obj.dom;
		if (dom.parentNode) {
			// workaround: nodeView cannot change their dom node
			const desc = emptyDom.pmViewDesc = dom.pmViewDesc;
			desc.nodeDOM = desc.contentDOM = desc.dom = emptyDom;
			dom.parentNode.replaceChild(emptyDom, dom);
		}
		obj.dom = emptyDom;
		while (dom.firstChild) emptyDom.appendChild(dom.firstChild);
		if (sameContentDOM) obj.contentDOM = obj.dom;
	}
	if (nobj.children.length) {
		// pmNode's contentDOM.children may be wrap, container, const
		let curpos = pos + 1;
		nobj.children.forEach(function(objChild, i) {
			const pmChild = pmNode.child(i);
			const newAttrs = Object.assign({}, pmChild.attrs, {
				_json: saveDomAttrs(objChild.dom)
			});
			const type = pmChild.type.spec.typeName;
			if (type != "root") {
				if (pmNode.attrs.id) {
					newAttrs._id = pmNode.attrs.id;
				}
				if (type == "const" || type == "container") {
					newAttrs._html = staticHtml(objChild.dom);
				}
			}
			if (!Number.isNaN(curpos)) {
				// updates that are incompatible with schema might happen (e.g. popup(title + content))
				tr.setNodeMarkup(curpos, null, newAttrs);
				// however, this transaction is going to happen right now,
				// before all rootNodeView children have been updated with *old* state
				pmChild.attrs = newAttrs; // so we must change pmNode right now !
				if (objChild.children.length) {
					const domChild = obj.contentDOM && obj.contentDOM.children[i];
					const desc = domChild && domChild.pmViewDesc || {};
					mutateNodeView(tr, curpos, pmChild, desc, objChild);
				}
				curpos += pmChild.nodeSize;
			}
		}, this);
	}
	if (!obj.dom) return;
	// first upgrade attributes
	mutateAttributes(obj.dom, nobj.dom);
	// then upgrade descendants
	let parent, node;
	if (!obj.contentDOM) {
		// remove all _pcElt
		parent = obj.dom;
		node = parent.firstChild;
		let cur;
		while (node) {
			if (node._pcElt || initial) {
				cur = node;
			} else {
				cur = null;
			}
			node = node.nextSibling;
			if (cur) parent.removeChild(cur);
		}
		node = nobj.dom.firstChild;
		while (node) {
			node._pcElt = true;
			cur = node;
			node = node.nextSibling;
			parent.appendChild(cur);
		}
		return;
	} else if (obj.dom == obj.contentDOM) {
		// our job is done
		return;
	}
	// there is something between dom and contentDOM
	let cont = obj.contentDOM;
	let ncont = nobj.contentDOM;

	while (cont != obj.dom) {
		mutateAttributes(cont, ncont);
		parent = cont.parentNode;
		node = cont;
		while (node.previousSibling) {
			if (node.previousSibling._pcElt || initial) {
				parent.removeChild(node.previousSibling);
			} else {
				node = node.previousSibling;
			}
		}
		node = cont;
		while (node.nextSibling) {
			if (node.nextSibling._pcElt || initial) {
				parent.removeChild(node.nextSibling);
			} else {
				node = node.nextSibling;
			}
		}
		while ((node = ncont.parentNode.firstChild) != ncont) {
			node._pcElt = true;
			parent.insertBefore(node, cont);
		}
		node = ncont;
		while (node.nextSibling) {
			node.nextSibling._pcElt = true;
			parent.appendChild(node.nextSibling);
		}
		cont = parent;
		ncont = ncont.parentNode;
	}
}

function mutateAttributes(dom, ndom) {
	restoreDomAttrs(attrsObj(ndom.attributes), dom);
}

function attrsObj(atts) {
	const obj = {};
	for (let k = 0; k < atts.length; k++) {
		obj[atts[k].name] = atts[k].value;
	}
	return obj;
}

const styleHelper = document.createElement('div');
function mapOfStyle(style) {
	const map = {};
	if (!style) return map;
	if (typeof style == "string") {
		styleHelper.setAttribute('style', style);
		style = styleHelper.style;
	}
	let name, val;
	for (let k = 0; k < style.length; k++) {
		name = style.item(k);
		val = style[name];
		if (val != null && val != "") map[name] = val;
	}
	return map;
}

function mapOfClass(att) {
	const map = {};
	(att || '').split(' ').forEach(function(str) {
		str = str.trim();
		if (str) map[str] = true;
	});
	return map;
}

function applyDiffClass(a, b) {
	return Object.keys(Object.assign(mapOfClass(a), mapOfClass(b))).join(' ');
}

function restoreDomAttrs(srcAtts, dom) {
	if (!srcAtts || !dom) return;
	let attr, name, dstVal, srcVal;
	const dstAtts = dom.attributes;
	let uiAtts = dom.pcUiAttrs;
	if (!uiAtts) {
		uiAtts = dom.pcUiAttrs = {};
	}
	// pcUiAttrs: attributes set by ui processes
	for (name in srcAtts) {
		if (name == "contenteditable") continue;
		dstVal = dom.getAttribute(name);
		srcVal = srcAtts[name];
		if (name == "class") {
			dom.setAttribute(name, applyDiffClass(srcVal, uiAtts[name]));
		} else if (name == "style") {
			Object.assign(dom.style, mapOfStyle(srcVal), mapOfStyle(uiAtts[name]));
		} else if (srcVal != dstVal) {
			dom.setAttribute(name, srcVal);
		}
	}

	for (let j = 0; j < dstAtts.length; j++) {
		attr = dstAtts[j];
		name = attr.name;
		if (name == "block-content" || name == "contenteditable") continue;
		// remove attribute if not in srcAtts unless it is set in uiAtts
		if (srcAtts[name] == null && uiAtts[name] == null) {
			dom.removeAttribute(name);
		}
	}
}

function flagDom(elt, dom, iterate, parent) {
	if (!dom) return;
	if (dom.nodeType == Node.TEXT_NODE) {
		return {text: dom.nodeValue};
	}
	if (dom.nodeType != Node.ELEMENT_NODE) return;
	if (!parent) parent = {};
	let type;
	if (!parent.type) type = "root";
	else if (parent.type == "root") type = ["container", "wrap"];
	else if (parent.type == "wrap") type = "container";
	const obj = {
		dom: dom,
		contentDOM: findContent(elt, dom, type)
	};
	if (!obj.children) obj.children = [];

	if (!dom.parentNode) {
		obj.type = 'root';
	} else if (obj.contentDOM) {
		if (obj.contentDOM.hasAttribute('block-content')) {
			if (parent.type != 'container') {
				obj.type = 'container';
			}
		} else {
			obj.type = 'wrap';
		}
	} else if (obj.dom && parent.type == 'wrap') {
		obj.type = 'const';
	}
	if (obj.contentDOM) {
		const contentDOM = obj.contentDOM.cloneNode(false);
		Array.prototype.forEach.call(obj.contentDOM.childNodes, function(node) {
			const child = flagDom(elt, node, iterate, obj);
			if (!child) return;
			if (["wrap", "container", "const"].includes(child.type)) {
				obj.children.push(child);
				contentDOM.appendChild(node.cloneNode(true));
			} else {
				// ignore it, it is used as default content by viewer
			}
		});
		if (obj.contentDOM != obj.dom) {
			obj.contentDOM.parentNode.replaceChild(contentDOM, obj.contentDOM);
		} else {
			obj.dom = contentDOM;
		}
		obj.contentDOM = contentDOM;
	}

	if (iterate && obj.type) {
		iterate(obj);
	}
	return obj;
}

function getImmediateContents(root, list) {
	if (root.hasAttribute('block-content')) {
		list.push(root);
		return;
	}
	Array.prototype.forEach.call(root.childNodes, function(node) {
		if (node.nodeType == Node.ELEMENT_NODE) getImmediateContents(node, list);
	});
}

function findContent(elt, dom, type) {
	if (elt.leaf) return;
	let node;
	if (elt.inline || elt.contents.unnamed) {
		if (type == "root") node = dom;
	} else {
		const list = [];
		getImmediateContents(dom, list);
		if (!list.length) return;
		node = list.ancestor();
	}
	if (node && node.nodeName == "TEMPLATE" && node.content.childNodes.length && node.childNodes.length == 0) {
		node.appendChild(node.content);
	}
	return node;
}

function setupView(me, node) {
	if (me.view && node.type.name == me.view.state.doc.type.name) {
		me.dom = me.contentDOM = me.view.dom;
	} else {
		me.dom = me.domModel.cloneNode(true);
		me.contentDOM = findContent(me.element, me.dom, node.type.spec.typeName);
	}
	me.contentName = node.type.spec.contentName;
	const def = me.element.contents.find(me.contentName);
	me.virtualContent = def && def.virtual;

	if (!me.contentDOM || me.contentDOM == me.dom) return;
	if (['span'].indexOf(me.contentDOM.nodeName.toLowerCase()) < 0) return;

	me.contentDOM.setAttribute("contenteditable", "true");
	me.dom.setAttribute("contenteditable", "false");

	[
		'focus',
		'selectionchange',
		// 'DOMCharacterDataModified'
	].forEach(function(type) {
		me.contentDOM.addEventListener(type, function(e) {
			me.view.dom.dispatchEvent(new e.constructor(e.type, e));
		}, false);
	});
}

function staticHtml(dom) {
	const copy = dom.cloneNode(true);
	const content = copy.hasAttribute('block-content') ? copy : copy.querySelector('[block-content]');
	if (content) content.textContent = '';
	return copy.outerHTML;
}

function saveDomAttrs(dom) {
	const map = domAttrsMap(dom);
	if (Object.keys(map).length == 0) return;
	return JSON.stringify(map);
}

function domAttrsMap(dom) {
	const map = {};
	const atts = dom.attributes;
	let att;
	for (let k = 0; k < atts.length; k++) {
		att = atts[k];
		if (att.value && !att.name.startsWith('block-')) map[att.name] = att.value;
	}
	return map;
}

function tryJSON(str) {
	if (!str) return;
	let obj;
	try {
		obj = JSON.parse(str);
	} catch(ex) {
		// eslint-disable-next-line no-console
		console.info("Bad attributes", str);
	}
	return obj;
}