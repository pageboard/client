const commonAncestor = require('@kapouer/common-ancestor');
const Model = require('prosemirror-model');
const {DiffDOM} = require('../lib/diffdom.js');

const differ = new DiffDOM({
	preDiffApply: function(info) {
		if (info.diff.action.endsWith("Attribute") && info.diff.name == "block-focused") {
			return true;
		}
	}
});

const innerDiff = new DiffDOM({
	filterOuterDiff: function(a, b, diffs) {
		if (a.attributes && a.attributes['block-content']) {
			a.innerDone = true;
		}
	},
	preDiffApply: function(info) {
		if (info.diff.action.endsWith("Attribute") && info.diff.name.startsWith("block-")) {
			return true;
		}
	}
});

exports.define = define;

function define(view, elt, schema, views) {
	if (!view.tags) view.tags = {};
	if (elt.name == "text") {
		schema.nodes = schema.nodes.remove(elt.name);
		schema.nodes = schema.nodes.addToStart(elt.name, elt);
		return;
	}
	if (!elt.render) return; // some elements are not meant to be rendered
	var dom = view.render(view.blocks.create(elt.name), {
		merge: false,
		genId: false
	});
	if (dom && dom.nodeType == Node.DOCUMENT_FRAGMENT_NODE && dom.children.length == 1) {
		dom = dom.children[0];
	}
	if (!dom || dom.nodeType != Node.ELEMENT_NODE) {
		console.error(`ignoring ${elt.name} element - render does not return a DOM Node`);
		return;
	}
	if (dom.parentNode) dom = dom.cloneNode(true);
	var index = 0;

	var contents = elt.contents;
	var contentsLen = contents.list.length;
	var domContents = dom.querySelectorAll('[block-content]');

	if (!contentsLen) {
		// leaf
	} else if (domContents.length > 1) {
		if (contentsLen != domContents.length) {
			console.error(`${elt.name} has ${contentsLen} contents but ${domContents.length} block-content`);
			return;
		}
	} else if (domContents.length == 1) {
		var contentName = domContents[0].getAttribute('block-content');
		if (contents.unnamed && contentName) {
			console.error(`${elt.name}.contents.id = ${contentName} is missing`);
			return;
		}
	} else if (contentsLen == 1 && dom.getAttribute('block-content') != contents.firstId) {
		console.error(`${elt.name}.html should contain a block-content="${contents.firstId}"`);
		return;
	}

	flagDom(elt, dom, function(obj) {
		var spec;
		var type = obj.type;
		if (type == "root") {
			spec = createRootSpec(view, elt, obj);
			obj.name = elt.name; // wrap and container are set further
		} else if (type == "wrap") {
			spec = createWrapSpec(view, elt, obj);
		} else if (type == "container") {
			spec = createContainerSpec(view, elt, obj);
		} else if (type == "const") {
			spec = createConstSpec(view, elt, obj);
		} else {
			throw new Error("Missing type in flagDom iterator", type, obj);
		}
		if (obj.children && obj.children.length) {
			// this type of node has content that is wrap or container type nodes
			spec.wrapper = true;
			spec.content = obj.children.map(function(child) {
				if (!child.name) console.warn(obj, "has no name for child", child);
				return child.name + (child.type == "const" ? "?" : "");
			}).join(" ");
		} else if (["root", "container"].includes(type) && !elt.leaf) {
			var def = contents.find(obj.contentDOM.getAttribute('block-content'));
			if (def) {
				var nodes = def.nodes;
				if (nodes) {
					spec.content = nodes;
					if (nodes != "text*" && !nodes.endsWith("inline*") && nodes.indexOf(' ') < 0) {
						if (nodes.endsWith('?')) {
							spec.content = `_ | ${nodes.slice(0, -1)}`;
						} else if (nodes.endsWith('*')) {
							spec.content = `(_ | ${nodes.slice(0, -1)})+`;
						}
					}
				}
				if (def.marks) spec.marks = def.marks;
				spec.contentName = def.id || "";
			}
		}

		if (!obj.name) {
			obj.name = `${elt.name}_${type}_${spec.contentName || index++}`;
		}

		var parseTag = spec.parseDOM && spec.parseDOM[0].tag;
		if (parseTag) {
			var parseTagKey = spec.typeName == "root" ? parseTag : `${elt.name} ${parseTag}`;
			if (elt.context) parseTagKey += " " + elt.context;
			if (elt.group) parseTagKey += " " + elt.group;
			var oldName = view.tags[parseTagKey];
			if (oldName) {
				console.info(`Two elements with same tag "${parseTag}" - ${oldName} and ${obj.name}`);
			} else {
				view.tags[parseTagKey] = obj.name;
			}
		}

		if (type == "root") {
			var existingName = elt.replaces || elt.name;
			if (elt.inline && spec.content) {
				if (schema.marks.get(existingName)) {
					schema.marks = schema.marks.remove(existingName);
				}
			} else {
				if (schema.nodes.get(existingName)) {
					schema.nodes = schema.nodes.remove(existingName);
				}
			}
		}
		if (spec.inline && spec.content) {
			schema.marks = schema.marks.addToStart(obj.name, spec);
		} else {
			schema.nodes = schema.nodes.addToStart(obj.name, spec);
		}
		if (spec.nodeView) {
			views[obj.name] = spec.nodeView;
		}
	});
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
	var node;
	if (elt.inline || elt.contents.unnamed) {
		if (type == "root") node = dom;
	} else {
		var list = [];
		getImmediateContents(dom, list);
		if (!list.length) return;
		node = commonAncestor.apply(null, list);
	}
	if (node && node.nodeName == "TEMPLATE" && node.content.childNodes.length && node.childNodes.length == 0) {
		node.appendChild(node.content);
	}
	return node;
}

function flagDom(elt, dom, iterate, parent) {
	if (!dom) return;
	if (dom.nodeType == Node.TEXT_NODE) {
		return {text: dom.nodeValue};
	}
	if (dom.nodeType != Node.ELEMENT_NODE) return;
	if (!parent) parent = {};
	var type;
	if (!parent.type) type = "root";
	else if (parent.type == "root") type = ["container", "wrap"];
	else if (parent.type == "wrap") type = "container";
	var obj = {
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
		var contentDOM = obj.contentDOM.cloneNode(false);
		Array.prototype.forEach.call(obj.contentDOM.childNodes, function(node) {
			var child = flagDom(elt, node, iterate, obj);
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

function toDOMOutputSpec(obj, node, inplace) {
	var out = 0;
	var dom = obj.contentDOM || obj.dom;
	var attrs = Object.assign(attrsTo(node.attrs), tryJSON(node.attrs._json), domAttrsMap(obj.dom));
	if (!inplace) {
		delete attrs['block-data'];
	}
	delete attrs['block-focused'];
	while (dom) {
		var contentName = dom.getAttribute('block-content') || undefined;
		if (dom != obj.dom) {
			out = [dom.nodeName, {
				'class': dom.className || undefined,
				'block-content': contentName
			}, out];
			delete attrs['block-content'];
		} else {
			if (contentName) attrs['block-content'] = contentName;
			if (!obj.contentDOM || node instanceof Model.Mark) {
				out = [dom.nodeName, attrs];
			} else {
				out = [dom.nodeName, attrs, out];
			}
			break;
		}
		dom = dom.parentNode;
	}
	return out;
}

function createRootSpec(view, elt, obj) {
	var defaultAttrs = {
		id: null,
		focused: null,
		data: null,
		expr: null,
		lock: null,
		type: elt.name,
		standalone: elt.standalone ? "true" : null
	};

	var defaultSpecAttrs = specAttrs(defaultAttrs);
	if (elt.inline && elt.contents.list.length == 1) obj.contentDOM = obj.dom;

	var parseRule = {
		priority: 1000 - (elt.priority || 0),
		getAttrs: function(dom) {
			var type = dom.getAttribute('block-type') || elt.name;
			var id = dom.getAttribute('block-id');
			var standalone = dom.getAttribute('block-standalone') == "true";
			var data = dom.getAttribute('block-data');
			var expr = dom.getAttribute('block-expr');
			var lock = dom.getAttribute('block-lock');
			var attrs = {};
			if (expr) attrs.expr = expr;
			if (lock) attrs.lock = lock;
			if (data) {
				attrs.data = data;
			} else if (elt.parse) {
				attrs.data = JSON.stringify(elt.parse.call(elt, dom));
			} else if (elt.inplace && elt.properties) {
				var dataObj = {};
				Object.keys(elt.properties).forEach(function(key) {
					var prop = elt.properties[key];
					var attr = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
					var val = dom.getAttribute(attr);
					if (val == null) {
						val = dom.dataset && dom.dataset[key] || null;
						if (val == null) return;
					}
					if (prop.type == "integer") {
						val = parseInt(val);
						if (!isNaN(val)) dataObj[key] = val;
					} else if (prop.type == "number") {
						val = parseFloat(val);
						if (!isNaN(val)) dataObj[key] = val;
					} else if (prop.type == "boolean") {
						dataObj[key] = val == "true";
					} else if (prop.type == "string") {
						dataObj[key] = val;
					}
				});
				attrs.data = JSON.stringify(dataObj);
			}


			if (elt.inplace) {
				if (id) delete attrs.id;
				attrs.type = type;
				return attrs;
			}
			var block = view.blocks.fromAttrs(attrs);
			if (id) {
				var oldBlock = view.blocks.get(id);
				if (oldBlock) {
					// update the stored block and keep default data
					block.data = Object.assign(oldBlock.data || {}, block.data);
					Object.assign(oldBlock, block);
					block = oldBlock;
				}
			}
			if (standalone) {
				if (!id) {
					console.warn("standalone block missing id", dom.outerHTML);
				} else {
					block.standalone = true;
					block.id = id;
				}
			} else if (dom.closest('[block-standalone="true"]')) {
				block.id = id;
			}
			if (!block.type) block.type = type;
			view.blocks.set(block);
			attrs = view.blocks.toAttrs(block);
			attrs.type = type;
			return attrs;
		},
		contentElement: function(dom) { return findContent(elt, dom, "root"); }
	};
	if (elt.context) {
		if (elt.context.split(/\s*\|\s*/).some((tok) => {
			while (tok.endsWith('/')) tok = tok.slice(0, -1);
			return tok.indexOf('/') >= 0;
		})) {
			console.warn("element.context should define only one parent type", elt.name, elt.context);
		} else {
			parseRule.context = elt.context;
		}
	}

	if (elt.tag) {
		parseRule.tag = elt.tag;
	} else if (elt.inplace) {
		parseRule.tag = domSelector(obj.dom);
	} else {
		parseRule.tag = `[block-type="${elt.name}"]`;
	}

	if (elt.preserveWhitespace) parseRule.preserveWhitespace = elt.preserveWhitespace;

	var spec = {
		typeName: "root",
		element: elt,
		domModel: obj.dom,
		inline: !!elt.inline,
		defining: obj.contentDOM ? obj.dom != obj.contentDOM : false,
		isolating: elt.isolating !== undefined ? elt.isolating : !elt.inline,
		attrs: Object.assign({}, defaultSpecAttrs),
		parseDOM: [parseRule],
		toDOM: function(node) {
			var id = node.attrs.id;
			if (!id && node.marks && node.marks[0]) {
				id = node.marks[0].attrs.id;
				console.warn("Probably unsupported case of id from in node.marks", elt.inline, node);
			}
			var block;
			if (id) block = view.blocks.get(id);

			if (!block) block = view.blocks.fromAttrs(node.attrs);
			else block.focused = node.attrs.focused;

			var dom = view.render(block, {type: node.attrs.type, merge: false});
			if (dom && dom.nodeType == Node.DOCUMENT_FRAGMENT_NODE && dom.children.length == 1) {
				dom = dom.children[0];
			}
			if (!dom) {
				console.error("Rendering", block, "with", node.attrs.type, "returns no dom");
				return "";
			}
			var uView = flagDom(elt, dom);
			var out = toDOMOutputSpec(uView, node, elt.inplace);
			return out;
		}
	};
	if (elt.code) spec.code = elt.code;
	if (elt.marks) spec.marks = elt.marks;
	spec.nodeView = RootNodeView;

	// explicitely allow dragging for nodes without contentDOM
	if (elt.draggable !== undefined) {
		spec.draggable = elt.draggable;
	} else if (!obj.contentDOM) {
		spec.draggable = true;
		if (!elt.inline) spec.atom = true;
	}
	if (elt.group) spec.group = elt.group;

	return spec;
}

function createWrapSpec(view, elt, obj) {
	var defaultAttrs = attrsFrom(obj.dom);
	defaultAttrs._json = null;
	defaultAttrs._id = null;
	defaultAttrs._html = null;
	var defaultSpecAttrs = specAttrs(defaultAttrs);
	var wrapTag = domSelector(obj.dom);
	if (wrapTag == "div") console.warn(elt.name, "should define a class on wrapper tag", obj.dom.outerHTML);

	var parseRule = {
		tag: wrapTag + ':not([block-type])',
		context: `${elt.name}//`, // FIXME context should be more precise but flagDom works bottom to top
		getAttrs: function(dom) {
			var attrs = attrsFrom(dom);
			var json = saveDomAttrs(dom);
			if (json) attrs._json = json;
			var root = dom.closest('[block-id]');
			if (root) attrs._id = root.getAttribute('block-id');
			return attrs;
		},
		contentElement: function(dom) { return findContent(elt, dom, 'wrap'); }
	};

	var spec = {
		typeName: "wrap",
		element: elt,
		domModel: obj.dom,
		attrs: defaultSpecAttrs,
		parseDOM: [parseRule],
		defining: obj.dom == obj.contentDOM,
		toDOM: function(node) {
			return toDOMOutputSpec(obj, node);
		},
		nodeView: WrapNodeView
	};
	return spec;
}

function createConstSpec(view, elt, obj) {
	var defaultAttrs = attrsFrom(obj.dom);
	defaultAttrs._id = null;
	defaultAttrs._json = null;
	defaultAttrs._html = null;
	var defaultSpecAttrs = specAttrs(defaultAttrs);
	var wrapTag = domSelector(obj.dom);

	var parseRule = {
		tag: wrapTag + ':not([block-type])',
		context: `${elt.name}//`,
		getAttrs: function(dom) {
			var attrs = {}; //attrsFrom(dom);
			attrs._html = dom.outerHTML;
			attrs._json = saveDomAttrs(dom);
			var root = dom.closest('[block-id]');
			if (root) attrs._id = root.getAttribute('block-id');
			return attrs;
		}
	};

	var spec = {
		typeName: "const",
		element: elt,
		atom: true,
		domModel: obj.dom,
		attrs: defaultSpecAttrs,
		parseDOM: [parseRule],
		toDOM: function(node) {
			return toDOMOutputSpec(obj, node);
		},
		nodeView: ConstNodeView
	};
	return spec;
}

function createContainerSpec(view, elt, obj) {
	var defaultAttrs = attrsFrom(obj.dom);
	if (obj.contentDOM != obj.dom) {
		defaultAttrs.content = obj.contentDOM.getAttribute("block-content");
	}
	defaultAttrs._json = null;
	defaultAttrs._id = null;
	defaultAttrs._html = null;
	var defaultSpecAttrs = specAttrs(defaultAttrs);
	var tag;
	if (obj.dom == obj.contentDOM) {
		tag = `${obj.dom.nodeName.toLowerCase()}[block-content="${defaultAttrs.content}"]`;
	} else {
		tag = domSelector(obj.dom) + `:not([block-content])`;
	}
	var parseRule = {
		tag: tag + ':not([block-type])',
		context: `${elt.name}//`, // FIXME context should be more precise but flagDom works bottom to top
		getAttrs: function(dom) {
			var attrs = attrsFrom(dom);
			var json = saveDomAttrs(dom);
			if (json) attrs._json = json;
			attrs._html = staticHtml(dom);
			var root = dom.closest('[block-id]');
			if (root) attrs._id = root.getAttribute('block-id');
			return attrs;
		},
		contentElement: function(dom) { return findContent(elt, dom, 'container'); }
	};

	var spec = {
		typeName: "container",
		element: elt,
		domModel: obj.dom,
		attrs: defaultSpecAttrs,
		defining: obj.dom != obj.contentDOM,
		parseDOM: [parseRule],
		toDOM: function(node) {
			return toDOMOutputSpec(obj, node);
		},
		nodeView: ContainerNodeView
	};
	return spec;
}

function staticHtml(dom) {
	const copy = dom.cloneNode(true);
	const content = copy.hasAttribute('block-content') ? copy : copy.querySelector('[block-content]');
	if (content) content.textContent = '';
	return copy.outerHTML;
}

function setupView(me, node) {
	if (me.view && node.type.name == me.view.state.doc.type.name) {
		me.dom = me.contentDOM = me.view.dom;
	} else {
		me.dom = me.domModel.cloneNode(true);
		me.contentDOM = findContent(me.element, me.dom, node.type.spec.typeName);
	}
	me.contentName = node.type.spec.contentName;
	var def = me.element.contents.find(me.contentName);
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

function RootNodeView(node, view, getPos, decorations) {
	if (!(this instanceof RootNodeView)) {
		return new RootNodeView(node, view, getPos, decorations);
	}
	this.view = view;
	this.element = node.type.spec.element;
	this.domModel = node.type.spec.domModel;
	this.getPos = typeof getPos == "function" ? getPos : null;
	this.id = node.attrs.id;
	if (!this.id && node.type.name == view.state.doc.type.name) {
		this.id = node.attrs.id = view.dom.getAttribute('block-id');
	}

	var block;
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

RootNodeView.prototype.selectNode = function() {
	this.selected = true;
	this.dom.classList.add('ProseMirror-selectednode');
};

RootNodeView.prototype.deselectNode = function() {
	this.selected = false;
	this.dom.classList.remove('ProseMirror-selectednode');
};

RootNodeView.prototype.update = function(node, decorations) {
	if (this.element.name != node.attrs.type) {
		return false;
	}
	var oldBlock = this.oldBlock;
	// TODO update instances of other standalone blocks !
	if (node.attrs.id != this.id) {
		return false;
	}
	var view = this.view;
	var uBlock = view.blocks.fromAttrs(node.attrs);
	var block;
	if (this.element.inplace) {
		block = uBlock;
	} else {
		block = view.blocks.get(this.id);
		if (!block) {
			console.warn("block should exist", node);
			return true;
		}
	}
	if (uBlock.data) block.data = uBlock.data;
	if (uBlock.expr) block.expr = uBlock.expr;
	if (uBlock.lock) block.lock = uBlock.lock;

	// consider it's the same data when it's initializing
	var sameData = false;
	if (oldBlock) {
		sameData = view.utils.equal(oldBlock.data || {}, block.data || {});
		if (sameData && block.expr) {
			sameData = view.utils.equal(oldBlock.expr || {}, block.expr || {});
		}
	}
	var sameFocus = oldBlock && oldBlock.focused == node.attrs.focused || false;

	if (!sameData || !sameFocus) {
		this.oldBlock = view.blocks.copy(block);
		this.oldBlock.focused = node.attrs.focused;

		if (node.attrs.focused) block.focused = node.attrs.focused;
		else delete block.focused;

		var dom = view.render(block, {type: node.attrs.type, merge: false});
		if (dom && dom.nodeType == Node.DOCUMENT_FRAGMENT_NODE && dom.children.length == 1) {
			dom = dom.children[0];
		}
		var tr = view.state.tr;
		mutateAttributes(this.dom, dom);
		if (!sameData) {
			var nobj = flagDom(this.element, dom);
			try {
				mutateNodeView(tr, this.getPos ? this.getPos() : null, node, this, nobj);
			} catch(ex) {
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

	var cname = node.type.spec.contentName;
	if (cname != null) {
		var cdom = this.contentDOM;
		if (!block.content) block.content = {};
		if (block.standalone && oldBlock) {
			if (!Array.isArray(block.content[cname])) {
				block.content[cname] = [];
			}
			var found = false;
			block.content[cname].forEach(function(idom) {
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
};

RootNodeView.prototype.ignoreMutation = function(record) {
	if (record.type == "attributes") {
		var dom = record.target;
		var obj = dom.pcUiAttrs;
		if (!obj) obj = dom.pcUiAttrs = {};
		var name = record.attributeName;
		var val = dom.getAttribute(name);
		if (name == "class") {
			if (record.oldValue != val) {
				var oldClass = mapOfClass(record.oldValue);
				var newClass = mapOfClass(val);
				var diffClass = {};
				for (var k in newClass) if (newClass[k] && !oldClass[k]) diffClass[k] = true;
				obj[name] = Object.keys(diffClass).join(' ');
			}
		} else if (name == "style") {
			if (record.oldValue != val) {
				var oldStyle = mapOfStyle(record.oldValue);
				var newStyle = mapOfStyle(dom.style);
				var diffStyle = [];
				for (var j in newStyle) if (newStyle[j] && !oldStyle[j]) diffStyle.push(j + ':' + newStyle[j] + ';');
				obj[name] = diffStyle.join('');
			}
		} else {
			obj[name] = val;
		}
		return true;
	}	else if (record.type == "childList" && record.addedNodes.length > 0 && !Array.prototype.some.call(record.addedNodes, function(node) {
		if (node.nodeType != Node.ELEMENT_NODE) return true;
		return node.getAttribute('contenteditable') != "false";
	})) {
		return true;
	} else if (record.target == this.contentDOM && record.type == "childList") {
		return false;
	} else if (record.type != "selection") {
		return true;
	}
};

function WrapNodeView(node, view, getPos, decorations) {
	if (!(this instanceof WrapNodeView)) {
		return new WrapNodeView(node, view, getPos, decorations);
	}
	this.view = view;
	this.getPos = typeof getPos == "function" ? getPos : null;
	this.element = node.type.spec.element;
	this.domModel = node.type.spec.domModel;
	setupView(this, node);
	this.update(node);
}

WrapNodeView.prototype.update = function(node, decorations) {
	if (!this.id) {
		this.id = node.attrs._id;
	} else if (this.id != node.attrs._id) {
		return false;
	}
	restoreDomAttrs(tryJSON(node.attrs._json), this.dom);
	return true;
};

WrapNodeView.prototype.ignoreMutation = function(record) {
	// always ignore mutation
	if (record.type != "selection") return true;
};

function ConstNodeView(node, view, getPos, decorations) {
	if (!(this instanceof ConstNodeView)) {
		return new ConstNodeView(node, view, getPos, decorations);
	}
	this.view = view;
	this.getPos = typeof getPos == "function" ? getPos : null;
	this.element = node.type.spec.element;
	this.domModel = node.type.spec.domModel;
	setupView(this, node);
	this.dom.setAttribute("contenteditable", "false");
	this.update(node);
}

ConstNodeView.prototype.update = function(node, decorations) {
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
};

ConstNodeView.prototype.ignoreMutation = function(record) {
	// always ignore mutation, even selection
	return true;
};

function ContainerNodeView(node, view, getPos, decorations) {
	if (!(this instanceof ContainerNodeView)) {
		return new ContainerNodeView(node, view, getPos, decorations);
	}
	this.view = view;
	this.element = node.type.spec.element;
	this.domModel = node.type.spec.domModel;

	setupView(this, node);
	this.update(node);
}

ContainerNodeView.prototype.update = function(node, decorations) {
	var contentName = node.type.spec.contentName;
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

	var block = this.view.blocks.get(this.id);
	if (!block) {
		console.warn("container has no root node id", this, node);
		return false;
	}

	if (!block.content) block.content = {};
	if (block.content[contentName] != this.contentDOM) {
		block.content[contentName] = this.contentDOM;
	}
	return !(this.virtualContent && node.childCount == 0 && this.dom.isConnected);
};

ContainerNodeView.prototype.ignoreMutation = function(record) {
	if (record.target == this.contentDOM && record.type == "childList") {
		return false;
	} else if (record.type != "selection") {
		return true;
	}
};

/*
Nota Bene: nodes between obj.dom and obj.contentDOM (included) can be modified
by front-end. So when applying a new rendered DOM, one only wants to apply
diff between initial rendering and new rendering, leaving user modifications
untouched.
*/

function mutateNodeView(tr, pos, pmNode, obj, nobj) {
	var dom = obj.dom;
	var initial = !obj._pcinit;
	if (initial) obj._pcinit = true;
	if (dom && nobj.dom.nodeName != dom.nodeName) {
		var emptyDom = nobj.dom.cloneNode(false);
		var sameContentDOM = obj.contentDOM == obj.dom;
		if (dom.parentNode) {
			// workaround: nodeView cannot change their dom node
			var desc = emptyDom.pmViewDesc = dom.pmViewDesc;
			desc.nodeDOM = desc.contentDOM = desc.dom = emptyDom;
			dom.parentNode.replaceChild(emptyDom, dom);
		}
		obj.dom = emptyDom;
		while (dom.firstChild) emptyDom.appendChild(dom.firstChild);
		if (sameContentDOM) obj.contentDOM = obj.dom;
	}
	if (nobj.children.length) {
		// pmNode's contentDOM.children may be wrap, container, const
		var curpos = pos + 1;
		nobj.children.forEach(function(objChild, i) {
			var pmChild = pmNode.child(i);
			var newAttrs = Object.assign({}, pmChild.attrs, {
				_json: saveDomAttrs(objChild.dom)
			});
			var type = pmChild.type.spec.typeName;
			if (type != "root") {
				if (pmNode.attrs.id) {
					newAttrs._id = pmNode.attrs.id;
				}
				if (type == "const" || type == "container") {
					newAttrs._html = staticHtml(objChild.dom);
				}
			}
			if (!isNaN(curpos)) {
				// updates that are incompatible with schema might happen (e.g. popup(title + content))
				tr.setNodeMarkup(curpos, null, newAttrs);
				// however, this transaction is going to happen right now,
				// before all rootNodeView children have been updated with *old* state
				pmChild.attrs = newAttrs; // so we must change pmNode right now !
				if (objChild.children.length)  {
					var domChild = obj.contentDOM && obj.contentDOM.children[i];
					var desc = domChild && domChild.pmViewDesc || {};
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
	var parent, node;
	if (!obj.contentDOM) {
		// remove all _pcElt
		parent = obj.dom;
		node = parent.firstChild;
		var cur;
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
	var cont = obj.contentDOM;
	var ncont = nobj.contentDOM;

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

function mapOfClass(att) {
	var map = {};
	(att || '').split(' ').forEach(function(str) {
		str = str.trim();
		if (str) map[str] = true;
	});
	return map;
}

const styleHelper = document.createElement('div');
function mapOfStyle(style) {
	var map = {};
	if (!style) return map;
	if (typeof style == "string") {
		styleHelper.setAttribute('style', style);
		style = styleHelper.style;
	}
	var name, val;
	for (var k = 0; k < style.length; k++) {
		name = style.item(k);
		val = style[name];
		if (val != null && val != "") map[name] = val;
	}
	return map;
}

function applyDiffClass(a, b) {
	return Object.keys(Object.assign(mapOfClass(a), mapOfClass(b))).join(' ');
}

function mutateAttributes(dom, ndom) {
	restoreDomAttrs(attrsObj(ndom.attributes), dom);
}

function saveDomAttrs(dom) {
	var map = domAttrsMap(dom);
	if (Object.keys(map).length == 0) return;
	return JSON.stringify(map);
}

function tryJSON(str) {
	if (!str) return;
	var obj;
	try {
		obj = JSON.parse(str);
	} catch(ex) {
		console.info("Bad attributes", str);
	}
	return obj;
}

function restoreDomAttrs(srcAtts, dom) {
	if (!srcAtts || !dom) return;
	var attr, name, dstVal, srcVal;
	var dstAtts = dom.attributes;
	var uiAtts = dom.pcUiAttrs;
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

	for (var j=0; j < dstAtts.length; j++) {
		attr = dstAtts[j];
		name = attr.name;
		if (name == "block-content" || name == "contenteditable") continue;
		// remove attribute if not in srcAtts unless it is set in uiAtts
		if (srcAtts[name] == null && uiAtts[name] == null) {
			dom.removeAttribute(name);
		}
	}
}

function domAttrsMap(dom) {
	var map = {};
	var atts = dom.attributes;
	var att;
	for (var k=0; k < atts.length; k++) {
		att = atts[k];
		if (att.value && !att.name.startsWith('block-')) map[att.name] = att.value;
	}
	return map;
}

function attrsTo(attrs) {
	var domAttrs = {};
	for (var k in attrs) {
		if (!k.startsWith('_') && attrs[k] != null && attrs[k] != '{}') domAttrs['block-' + k] = attrs[k];
	}
	return domAttrs;
}

function attrsFrom(dom) {
	var domAttrs = dom.attributes;
	var att, attrs = {};
	for (var i=0; i < domAttrs.length; i++) {
		att = domAttrs[i];
		if (att.name.startsWith('block-')) {
			attrs[att.name.substring(6)] = att.value;
		}
	}
	return attrs;
}

function specAttrs(atts) {
	var obj = {};
	var val;
	for (var k in atts) {
		val = atts[k];
		obj[k] = {};
		obj[k].default = val && val.default || val;
	}
	return obj;
}

function attrsObj(atts) {
	var obj = {};
	for (var k=0; k < atts.length; k++) {
		obj[atts[k].name] = atts[k].value;
	}
	return obj;
}

function domSelector(dom) {
	var sel = dom.nodeName.toLowerCase();
	var cn = dom.className;
	// might be SVGAnimatedString
	if (cn && cn.baseVal != null) cn = cn.baseVal;
	if (cn) {
		sel += cn.split(' ').filter(function(str) {
			return !!str;
		}).map(function(str) {
			return '.' + str;
		}).join('');
	}
	return sel;
}

