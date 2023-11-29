import { Mark } from 'prosemirror-model';
import {
	RootNodeView,
	ConstNodeView,
	ContainerNodeView,
	WrapNodeView,
	flagDom, findContent, tryJSON, domAttrsMap, saveDomAttrs, staticHtml
} from './node-views';

export default function define(viewer, elt, schema, nodeViews) {
	if (!viewer.tags) viewer.tags = {};
	if (elt.name == "text") {
		schema.nodes = schema.nodes.addToStart(elt.name, elt);
		return;
	}
	if (!elt.dom) return; // some elements are not meant to be rendered
	let dom = elt.dom ?? viewer.render(viewer.blocks.create(elt.name), {
		merge: false,
		genId: false
	});
	if (dom?.nodeType == Node.DOCUMENT_FRAGMENT_NODE && dom?.children.length == 1) {
		dom = dom.children[0];
	}
	if (!dom || dom.nodeType != Node.ELEMENT_NODE) {
		// eslint-disable-next-line no-console
		console.error(`ignoring ${elt.name} element - render does not return a DOM Node`);
		return;
	}
	if (dom.parentNode) dom = dom.cloneNode(true);
	let index = 0;

	const contents = elt.contents;
	const contentsLen = contents.list.length;
	const domContents = dom.querySelectorAll('[block-content]');

	if (!contentsLen) {
		// leaf
	} else if (domContents.length > 1) {
		if (contentsLen != domContents.length) {
			// eslint-disable-next-line no-console
			console.error(`${elt.name} has ${contentsLen} contents but ${domContents.length} block-content`);
			return;
		}
	} else if (domContents.length == 1) {
		const contentName = domContents[0].getAttribute('block-content');
		if (contents.unnamed && contentName) {
			// eslint-disable-next-line no-console
			console.error(`${elt.name}.contents.id = ${contentName} is missing`);
			return;
		}
	} else if (contentsLen == 1 && dom.getAttribute('block-content') != contents.firstId) {
		// eslint-disable-next-line no-console
		console.error(`${elt.name}.html should contain a block-content="${contents.firstId}"`);
		return;
	}

	flagDom(elt, dom, (obj) => {
		let spec;
		const type = obj.type;
		if (type == "root") {
			spec = createRootSpec(elt, obj, viewer);
			obj.name = elt.name; // wrap and container are set further
		} else if (type == "wrap") {
			spec = createWrapSpec(elt, obj);
		} else if (type == "container") {
			spec = createContainerSpec(elt, obj);
		} else if (type == "const") {
			spec = createConstSpec(elt, obj);
		} else {
			throw new Error("Missing type in flagDom iterator", type, obj);
		}
		if (obj?.children.length) {
			// this type of node has content that is wrap or container type nodes
			spec.wrapper = true;
			spec.content = obj.children.map(child => {
				// eslint-disable-next-line no-console
				if (!child.name) console.warn(obj, "has no name for child", child);
				return child.name + (child.type == "const" ? "?" : "");
			}).join(" ");
		} else if (["root", "container"].includes(type) && !elt.leaf) {
			const def = contents.find(obj.contentDOM.getAttribute('block-content'));
			if (def) {
				const nodes = def.nodes;
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

		const parseTag = spec.parseDOM?.[0].tag;
		if (parseTag) {
			let parseTagKey = spec.typeName == "root" ? parseTag : `${elt.name} ${parseTag}`;
			if (elt.context) parseTagKey += " " + elt.context;
			if (elt.group) parseTagKey += " " + elt.group;
			const oldName = viewer.tags[parseTagKey];
			if (oldName) {
				// eslint-disable-next-line no-console
				console.debug(`Two elements with same tag "${parseTag}" - ${oldName} and ${obj.name}`);
			} else {
				viewer.tags[parseTagKey] = obj.name;
			}
		}

		if (type == "root") {
			const existingName = elt.replaces || elt.name;
			if (elt.inline && spec.content) {
				if (schema.marks.get(existingName)) {
					schema.marks = schema.marks.remove(existingName);
				}
			} else if (schema.nodes.get(existingName)) {
				schema.nodes = schema.nodes.remove(existingName);
			}
		}
		if (spec.inline && spec.content) {
			schema.marks = schema.marks.addToStart(obj.name, spec);
		} else {
			schema.nodes = schema.nodes.addToStart(obj.name, spec);
		}
		if (spec.nodeView) {
			nodeViews[obj.name] = spec.nodeView;
		}
	});
}

function toDOMOutputSpec(obj, node) {
	let out = 0;
	let dom = obj.contentDOM || obj.dom;
	const attrs = {
		...attrsTo(node.attrs),
		...tryJSON(node.attrs._json),
		...domAttrsMap(obj.dom)
	};
	delete attrs['block-data'];
	delete attrs['block-focused'];
	while (dom) {
		const contentName = dom.getAttribute('block-content') || undefined;
		if (dom != obj.dom) {
			out = [dom.nodeName, {
				'class': dom.className || undefined,
				'block-content': contentName
			}, out];
			delete attrs['block-content'];
		} else {
			if (contentName) attrs['block-content'] = contentName;
			if (!obj.contentDOM) {
				out = [dom.nodeName, attrs, dom.textContent];
			} else if (node instanceof Mark) {
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

function createRootSpec(elt, obj, viewer) {
	const defaultAttrs = {
		id: null,
		focused: null,
		data: null,
		expr: null,
		lock: null,
		type: elt.name,
		standalone: elt.standalone ? "true" : null
	};

	const defaultSpecAttrs = specAttrs(defaultAttrs);
	if (elt.inline && elt.contents.list.length == 1) obj.contentDOM = obj.dom;

	const parseRule = {
		priority: 1000 - (elt.priority || 0),
		getAttrs: function(dom) {
			const type = dom.getAttribute('block-type') || elt.name;
			const id = dom.getAttribute('block-id');
			const standalone = dom.getAttribute('block-standalone') == "true";
			const data = dom.getAttribute('block-data');
			const expr = dom.getAttribute('block-expr');
			const lock = dom.getAttribute('block-lock');
			const attrs = {};
			if (expr) attrs.expr = expr;
			if (lock) attrs.lock = lock;
			if (data) {
				attrs.data = data;
			} else if (elt.parse) {
				attrs.data = JSON.stringify(elt.parse(dom));
			} else if (elt.inplace && elt.properties && !elt.parse) {
				console.debug(elt.name, "is inline and missing parse(dom)");
			}

			if (elt.inplace) {
				if (id) delete attrs.id;
				attrs.type = type;
				return attrs;
			}
			let block = viewer.blocks.fromAttrs(attrs);
			if (id) {
				const oldBlock = viewer.blocks.get(id);
				if (oldBlock) {
					// update the stored block and keep default data
					block.data = { ...oldBlock.data, ...block.data };
					Object.assign(oldBlock, block);
					block = oldBlock;
				}
			}
			if (standalone) {
				if (!id) {
					// eslint-disable-next-line no-console
					console.warn("standalone block missing id", dom.outerHTML);
				} else {
					block.standalone = true;
					block.id = id;
				}
			} else if (dom.closest('[block-standalone="true"]')) {
				block.id = id;
			}
			if (!block.type) block.type = type;
			viewer.blocks.set(block);
			const ret = viewer.blocks.toAttrs(block);
			ret.type = type;
			return ret;
		},
		contentElement: function(dom) { return findContent(elt, dom, "root"); }
	};
	if (elt.context) {
		if (elt.context.split(/\s*\|\s*/).some(tok => {
			while (tok.endsWith('/')) tok = tok.slice(0, -1);
			return tok.indexOf('/') >= 0;
		})) {
			// eslint-disable-next-line no-console
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

	const spec = {
		typeName: "root",
		element: elt,
		domModel: obj.dom,
		excludes: elt.excludes,
		inline: Boolean(elt.inline),
		defining: obj.contentDOM ? obj.dom != obj.contentDOM : false,
		isolating: elt.isolating !== undefined ? elt.isolating : !elt.inline,
		attrs: { ...defaultSpecAttrs },
		parseDOM: [parseRule],
		toDOM: function(node) {
			let id = node.attrs.id;
			if (!id && node.marks?.[0] && !elt.contents.leaf) {
				id = node.marks[0].attrs.id;
				// eslint-disable-next-line no-console
				console.warn("Probably unsupported case of id from in node.marks", elt.inline, node);
			}
			let block;
			if (id) block = viewer.blocks.get(id);

			if (!block) block = viewer.blocks.fromAttrs(node.attrs);
			else block.focused = node.attrs.focused;

			let dom = viewer.render(block, {type: node.attrs.type, merge: false});
			if (dom?.nodeType == Node.DOCUMENT_FRAGMENT_NODE && dom?.children.length == 1) {
				dom = dom.children[0];
			}
			if (!dom) {
				// eslint-disable-next-line no-console
				console.error("Rendering", block, "with", node.attrs.type, "returns no dom");
				return "";
			}
			const uView = flagDom(elt, dom);
			const out = toDOMOutputSpec(uView, node, !elt.inplace || elt.parse);
			return out;
		}
	};
	if (elt.code) spec.code = elt.code;
	if (elt.marks) spec.marks = elt.marks;
	spec.nodeView = (...args) => new RootNodeView(...args);

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

function createWrapSpec(elt, obj) {
	const defaultAttrs = attrsFrom(obj.dom);
	defaultAttrs._json = null;
	defaultAttrs._id = null;
	defaultAttrs._html = null;
	const defaultSpecAttrs = specAttrs(defaultAttrs);
	const wrapTag = domSelector(obj.dom);
	// eslint-disable-next-line no-console
	if (wrapTag == "div") console.warn(elt.name, "should define a class on wrapper tag", obj.dom.outerHTML);

	const parseRule = {
		tag: wrapTag + ':not([block-type])',
		context: `${elt.name}//`, // FIXME context should be more precise but flagDom works bottom to top
		getAttrs: function(dom) {
			const attrs = attrsFrom(dom);
			const json = saveDomAttrs(dom);
			if (json) attrs._json = json;
			const root = dom.closest('[block-id]');
			if (root) attrs._id = root.getAttribute('block-id');
			return attrs;
		},
		contentElement: function(dom) { return findContent(elt, dom, 'wrap'); }
	};

	const spec = {
		typeName: "wrap",
		element: elt,
		domModel: obj.dom,
		attrs: defaultSpecAttrs,
		parseDOM: [parseRule],
		defining: obj.dom == obj.contentDOM,
		toDOM: function(node) {
			return toDOMOutputSpec(obj, node, true);
		},
		nodeView: (...args) => new WrapNodeView(...args)
	};
	return spec;
}

function createConstSpec(elt, obj) {
	const defaultAttrs = attrsFrom(obj.dom);
	defaultAttrs._id = null;
	defaultAttrs._json = null;
	defaultAttrs._html = null;
	const defaultSpecAttrs = specAttrs(defaultAttrs);
	const wrapTag = domSelector(obj.dom);

	const parseRule = {
		tag: wrapTag + ':not([block-type])',
		context: `${elt.name}//`,
		getAttrs: function(dom) {
			const attrs = {}; //attrsFrom(dom);
			attrs._html = dom.outerHTML;
			attrs._json = saveDomAttrs(dom);
			const root = dom.closest('[block-id]');
			if (root) attrs._id = root.getAttribute('block-id');
			return attrs;
		}
	};

	const spec = {
		typeName: "const",
		element: elt,
		atom: true,
		domModel: obj.dom,
		attrs: defaultSpecAttrs,
		parseDOM: [parseRule],
		toDOM: function(node) {
			return toDOMOutputSpec(obj, node, true);
		},
		nodeView: (...args) => new ConstNodeView(...args)
	};
	return spec;
}

function createContainerSpec(elt, obj) {
	const defaultAttrs = attrsFrom(obj.dom);
	if (obj.contentDOM != obj.dom) {
		defaultAttrs.content = obj.contentDOM.getAttribute("block-content");
	}
	defaultAttrs._json = null;
	defaultAttrs._id = null;
	defaultAttrs._html = null;
	const defaultSpecAttrs = specAttrs(defaultAttrs);
	let tag;
	if (obj.dom == obj.contentDOM) {
		tag = `${obj.dom.nodeName.toLowerCase()}[block-content="${defaultAttrs.content}"]`;
	} else {
		tag = domSelector(obj.dom) + `:not([block-content])`;
	}
	const parseRule = {
		tag: tag + ':not([block-type])',
		context: `${elt.name}//`, // FIXME context should be more precise but flagDom works bottom to top
		getAttrs: function(dom) {
			const attrs = attrsFrom(dom);
			const json = saveDomAttrs(dom);
			if (json) attrs._json = json;
			attrs._html = staticHtml(dom);
			const root = dom.closest('[block-id]');
			if (root) attrs._id = root.getAttribute('block-id');
			return attrs;
		},
		contentElement: function(dom) { return findContent(elt, dom, 'container'); }
	};

	const spec = {
		typeName: "container",
		element: elt,
		domModel: obj.dom,
		attrs: defaultSpecAttrs,
		defining: obj.dom != obj.contentDOM,
		parseDOM: [parseRule],
		toDOM: function(node) {
			return toDOMOutputSpec(obj, node, true);
		},
		nodeView: (...args) => new ContainerNodeView(...args)
	};
	return spec;
}

function attrsTo(attrs) {
	const domAttrs = {};
	for (const [k, v] of Object.entries(attrs)) {
		if (!k.startsWith('_') && v != null && v != '{}') domAttrs['block-' + k] = v;
	}
	return domAttrs;
}

function attrsFrom(dom) {
	const attrs = {};
	for (const att of dom.attributes) {
		if (att.name.startsWith('block-')) {
			attrs[att.name.substring(6)] = att.value;
		}
	}
	return attrs;
}

function specAttrs(atts) {
	const obj = {};
	for (const [k, val] of Object.entries(atts)) {
		obj[k] = {};
		obj[k].default = val?.default ?? val;
	}
	return obj;
}



function domSelector(dom) {
	let sel = dom.nodeName.toLowerCase();
	let cn = dom.className;
	// might be SVGAnimatedString
	if (cn?.baseVal != null) cn = cn.baseVal;
	if (cn) {
		// ignore non allowed characters for a selector - nicely removes template strings
		sel += cn.split(' ').filter(str => Boolean(str) && !/[[\]]/.test(str))
			.map(str => `.${str}`)
			.join('');
	}
	return sel;
}

