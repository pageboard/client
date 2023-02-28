import { AllSelection, Selection, TextSelection, NodeSelection } from "prosemirror-state";
import { Slice, Fragment, ResolvedPos, Mark } from "prosemirror-model";
import { toggleMark } from "prosemirror-commands";
import DeepEqual from "fast-deep-equal";

export default class Utils {
	constructor(view) {
		this.view = view;
	}
	equal(a, b) {
		return DeepEqual(a, b);
	}

	setDom(dom) {
		const state = this.view.state;
		const tr = state.tr;
		this.insertTr(tr, dom, new AllSelection(tr.doc));
		if (!tr) {
			console.error("Cannot insert", dom);
			return;
		}
		const sel = tr.selection;
		if (!sel.empty) tr.setSelection(Selection.atStart(tr.doc));
		tr.setMeta('addToHistory', false);
		this.view.dispatch(tr);

		// TODO find a better place to set this
		const id = this.view.dom.getAttribute('block-id');
		const block = this.view.blocks.get(id);
		if (!id) {
			console.error("Missing block-id attribute on", this.view.dom);
			return;
		}
		if (!block) {
			console.error("Root block not found for", this.view.dom);
			return;
		}
		if (!block.content) {
			console.warn("unsupported case: setting a block dom node that has no content");
			return;
		}
		const el = this.view.element(block.type);
		el.contents.set(block, this.view.dom);
	}

	getDom() {
		// in an offline document
		return this.view.someProp("viewSerializer").serializeFragment(this.view.state.doc.content, {
			document: this.view.doc.cloneNode(false) // offline
		});
	}

	insert(dom, sel) {
		const tr = this.view.state.tr;
		if (this.insertTr(tr, dom, sel) != null) {
			this.view.dispatch(tr);
		}
	}

	splitTr(tr, pos) {
		let cur;
		let depth = 1;
		const maxDepth = tr.doc.resolve(pos).depth;
		while (cur == null && depth <= maxDepth) {
			try {
				tr.split(pos - 1, depth);
				cur = pos;
			} catch (ex) {
				depth++;
			}
		}
		return cur;
	}

	insertTr(tr, dom, sel) {
		if (!sel) sel = tr.selection;
		if (!dom.ownerDocument) {
			dom = this.view.render(dom);
		}
		const parent = sel.$from.parent;
		// when replacing current selection, parse sel.$from
		// when appending after selection, parse sel.$to
		let slice = this.parse(dom, sel.node ? sel.$to : sel.$from);

		let from = sel.from;
		let to = sel.to;

		let fromto = from;
		if (sel.node?.type.name == "_") {
			to = from;
		}
		if (slice.content.childCount == 1 && (from == to || sel.node)) {
			const frag = this.fill(slice.content);
			const node = frag.firstChild;
			const atStart = !sel.node && sel.$from.parentOffset == 0;
			let insertPos;
			if (atStart) {
				insertPos = this.nextInsertPoint(tr, from + 1, node.type, -1, true);
			}
			if (insertPos == null) {
				insertPos = this.nextInsertPoint(tr, to - 1, node.type, 1, true);
			}
			if (insertPos != null) {
				return this.insertTrNode(tr, insertPos, node);
			}
			if (parent.isTextblock && !node.isInline) {
				tr.split(from);
				fromto = from + 1;
			}
			slice = new Slice(frag, 0, 0);
			to = from = fromto;
		}
		tr.replaceRange(from, to, slice);
		return fromto;
	}

	insertTrNode(tr, pos, node) {
		const $pos = tr.doc.resolve(pos);
		let from = pos;
		let to = pos;
		if ($pos.nodeBefore?.type.name == "_") from = pos - 1;
		if ($pos.nodeAfter?.type.name == "_") to = pos + 1;
		tr.replaceWith(from, to, node);
		return from;
	}

	fill(frag) {
		if (!(frag instanceof Fragment)) frag = Fragment.from(frag);
		const list = [];
		frag.forEach(node => {
			let content = node.content;
			if (content.size) {
				const before = node.type.contentMatch.fillBefore(content);
				if (before) {
					content = before.append(content);
				}
			}
			const match = node.type.contentMatch.matchFragment(content);
			if (match) {
				const after = match.fillBefore(Fragment.empty, true);
				if (after) content = content.append(after);
			}
			list.push(node.copy(this.fill(content)));
		});
		return Fragment.from(list);
	}

	delete(sel) {
		const tr = this.view.state.tr;
		this.deleteTr(tr, sel);
		this.view.dispatch(tr);
	}

	deleteTr(tr, sel) {
		if (!sel) sel = tr.selection;
		if (sel.empty) return;
		if (sel.node?.type.name == "_") return;
		const start = sel.anchor !== undefined ? sel.anchor : sel.from;
		const end = sel.head !== undefined ? sel.head : sel.to;
		tr.delete(start, end);
		return true;
	}

	parse(dom, $pos) {
		if (dom.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
			const frag = dom.ownerDocument.createDocumentFragment();
			frag.appendChild(dom);
			dom = frag;
		}
		return this.view.parseFromClipboard(dom, $pos);
	}

	refresh(dom, block) {
		const tr = this.refreshTr(this.view.state.tr, dom, block);
		if (!tr) console.error("Cannot refresh", dom);
		else this.view.dispatch(tr);
	}

	refreshTr(tr, dom, block) {
		let pos;
		if (dom instanceof ResolvedPos) {
			pos = dom.pos;
			dom = null;
		} else {
			pos = this.posFromDOM(dom);
		}
		if (pos === false) return;
		const parent = this.parents(tr, pos);
		if (!parent) return;
		const root = parent.root;
		if (!block) {
			const id = (parent.inline?.node.marks.find(mark => {
				return mark.attrs.id != null;
			}) ?? root.node).attrs.id;
			if (!id) return;
			block = this.view.blocks.get(id);
			if (!block) return; // nothing to refresh
		}
		const attrs = this.view.blocks.toAttrs(block);
		let type = dom?.getAttribute('block-type');
		if (type) attrs.type = type; // dom can override block.type
		else type = block.type;

		const sel = tr.selection;
		let node;
		if (parent.inline) {
			node = parent.inline.node;
			if (sel.empty || sel.node) {
				if (node.marks.some(mark => {
					if (attrs.id && attrs.id != mark.attrs.id) return;
					const markType = mark.attrs.type;
					if (!markType || type != markType) return;
					if (mark.attrs.focused) {
						// block.focused cannot be stored here since it is inplace
						attrs.focused = mark.attrs.focused;
					}
					const [exFrom, exTo] = this.extendUpdateMark(tr, sel.from, sel.to, mark, attrs);
					tr.setSelection(TextSelection.create(tr.doc, exFrom, exTo));
					return true;
				})) return tr;
			} else {
				const markType = this.view.state.schema.marks[type];
				if (markType) {
					tr.addMark(sel.from, sel.to, markType.create(attrs));
					return tr;
				}
			}
		}
		node = parent.root.node;
		if (!attrs.id && node.attrs.focused) {
			// block.focused cannot be stored here since it is inplace
			attrs.focused = node.attrs.focused;
		}
		if (attrs.id && attrs.id != node.attrs.id) {
			console.warn("Cannot refresh, node id do not match", attrs.id, node.attrs.id);
			return tr;
		}
		let selectedNode = sel.from === pos && sel.node;
		try {
			tr.setNodeMarkup(pos, null, attrs);
		} catch (ex) {
			// ignore
			console.warn(ex);
			selectedNode = false;
		}
		if (selectedNode) {
			tr.setSelection(NodeSelection.create(tr.doc, pos));
		}
		return tr;
	}

	selectDom(node, textSelection) {
		const pos = this.posFromDOM(node);
		const tr = this.view.state.tr;
		const $pos = tr.doc.resolve(pos);
		let sel;
		if (node.nodeType != Node.ELEMENT_NODE || textSelection) {
			sel = new TextSelection($pos);
		} else {
			if (!$pos.nodeAfter) {
				if (node.parentNode && node.parentNode != this.view.dom) this.selectDom(node.parentNode);
				else console.warn("cannot select node", node);
				return;
			}
			sel = new NodeSelection($pos);
		}
		this.view.dispatch(tr.setSelection(sel));
	}

	select(obj, textSelection) {
		return this.selectTr(this.view.state.tr, obj, textSelection);
	}

	selectTr(tr, obj, textSelection) {
		let parent, pos;
		if (obj.root?.rpos) {
			parent = obj;
		} else if (obj instanceof Selection) {
			parent = this.selectionParents(tr, obj).shift();
		} else {
			if (obj instanceof ResolvedPos) {
				pos = obj.pos;
			} else if (obj.ownerDocument == this.view.dom.ownerDocument) {
				if (obj == this.view.dom) {
					return new AllSelection(tr.doc);
				} else if (obj.pmViewDesc) {
					if (textSelection || obj.pmViewDesc.mark) {
						return TextSelection.create(tr.doc, obj.pmViewDesc.posAtStart, obj.pmViewDesc.posAtEnd);
					} else {
						return new NodeSelection(tr.doc.resolve(obj.pmViewDesc.posBefore));
					}
				} else {
					pos = this.posFromDOM(obj);
				}
			} else {
				pos = obj;
			}
			if (typeof pos != "number") return;
			parent = this.parents(tr, pos);
		}
		if (!parent) {
			return false;
		}
		const root = parent.root;
		if (!root) {
			return false;
		}
		const $pos = root.rpos;
		const $rootPos = root.level ? tr.doc.resolve(root.rpos.before(root.level)) : root.rpos;

		if (!$pos.nodeAfter) textSelection = true;
		if (parent.inline && !parent.inline.node.isLeaf) {
			const nodeBefore = root.rpos.nodeBefore;
			const nodeAfter = root.rpos.nodeAfter;

			let start = root.rpos.pos;
			if (nodeBefore && Mark.sameSet(nodeBefore.marks, parent.inline.node.marks)) {
				start = start - root.rpos.nodeBefore.nodeSize;
			}
			let end = root.rpos.pos;
			if (nodeAfter && Mark.sameSet(nodeAfter.marks, parent.inline.node.marks)) {
				end = end + root.rpos.nodeAfter.nodeSize;
			}
			return TextSelection.create(tr.doc, start, end);
		} else if (textSelection) {
			if (tr.selection.node) {
				return TextSelection.create(tr.doc, $pos.pos, $pos.pos);
			} else {
				return tr.selection;
			}
		} else if (root.node == tr.doc) {
			return new AllSelection(root.node);
		} else {
			return new NodeSelection($rootPos);
		}
	}

	replace(by, sel) {
		const tr = this.replaceTr(this.view.state.tr, by, sel);
		if (!tr) console.error("Cannot replace", sel);
		else this.view.dispatch(tr);
	}

	replaceTr(tr, by, sel, textSelection) {
		// sel can be ResolvedPos or pos or dom node or a selection
		sel = this.selectTr(tr, sel, textSelection);
		if (!sel) return false;
		return this.insertTr(tr, by, sel);
	}

	remove(src) {
		const tr = this.removeTr(this.view.state.tr, src);
		if (!tr) console.error("Cannot remove", src);
		else this.view.dispatch(tr);
	}

	removeTr(tr, src) {
		const sel = this.selectTr(tr, src);
		if (!sel) return false;
		return this.deleteTr(tr, sel);
	}

	posFromDOM(dom) {
		let offset = 0;
		if (dom != this.view.dom) {
			let sib = dom;
			while ((sib = sib.previousSibling)) {
				offset++;
			}
			dom = dom.parentNode;
		}
		if (!dom) {
			console.warn("FIXME", "cannot find posFromDOM of a dom node without parent", dom);
			return false;
		}
		let pos;
		try {
			pos = this.view.posAtDOM(dom, offset, 0);
		} catch (ex) {
			// eslint-disable-next-line no-console
			console.debug(ex);
			pos = false;
		}
		return pos;
	}

	posToDOM(pos) {
		if (pos == null) return;
		try {
			return this.view.nodeDOM(pos);
		} catch (ex) {
			return false;
		}
	}

	parents(tr, pos, all, before) {
		const rpos = tr.doc.resolve(pos);
		const depth = rpos.depth + 1;
		const ret = [];
		let node, type, obj, level = depth;
		while (level >= 0) {
			if (!obj) obj = {};
			if (level == depth) {
				node = rpos.node(level);
				if (!node) {
					if (before) {
						node = rpos.nodeBefore;
					} else {
						node = rpos.nodeAfter;
					}
				}
				type = node?.type.spec.typeName;
			} else {
				node = rpos.node(level);
				type = node.type?.spec.typeName;
			}
			if (type && type != "const") {
				obj[type] = { rpos: rpos, level: level, node: node };
			}
			if (node) {
				if (node.marks?.length) {
					obj.inline = {
						node: node,
						rpos: rpos
					};
				}
				if ((type == "container" || level != depth) && node.attrs.content) {
					if (!obj.container) obj.container = obj.root ?? {};
					obj.container.name = node.attrs.content;
				}
				if (type == "root") {
					const el = node.type.spec.element;
					if (!el.inline && el.contents.firstId) {
						if (!obj.container) obj.container = obj.root ?? {};
						obj.container.name = el.contents.firstId;
					}
				}
			}
			if (type == "root") {
				if (!all) break;
				ret.push(obj);
				obj = null;
			}
			level--;
		}
		if (all) return ret;
		else return obj;
	}

	selectionParents(tr, sel) {
		if (!sel) sel = tr.selection;
		if (sel instanceof AllSelection) {
			return [{ root: { node: tr.doc } }];
		}
		const fromParents = this.parents(tr, sel.from, true, false);
		if (sel.empty) return fromParents;
		const toParents = this.parents(tr, sel.to, true, true);
		const parents = [];
		let from, to;
		for (let i = 1; i <= fromParents.length && i <= toParents.length; i++) {
			from = fromParents[fromParents.length - i];
			to = toParents[toParents.length - i];
			if (from.root.node == to.root.node) parents.unshift(from);
			else break;
		}
		return parents;
	}

	canMark(sel, nodeType) {
		const state = this.view.state;
		const context = Utils.parseContext(nodeType.spec.element?.context);
		let can = sel.$from.depth == 0 ? state.doc.type.allowsMarkType(nodeType) : false;
		try {
			state.doc.nodesBetween(sel.from, sel.to, (node, pos) => {
				if (can) return false;
				if (node.inlineContent && node.type.allowsMarkType(nodeType)) {
					if (context) {
						const $pos = state.doc.resolve(pos);
						for (let d = $pos.depth; d >= 0; d--) {
							can = Utils.checkContext(context, $pos.node(d).type, d >= $pos.depth - 1);
							if (can) break;
						}
					} else {
						can = true;
					}
				}
			});
		} catch (ex) {
			// can fail in some circumstances
		}
		return can;
	}

	canInsert($pos, nodeType, all, after) {
		const context = Utils.parseContext(nodeType.spec.element?.context);
		let contextOk = !context;
		let found = false;
		const ret = {};
		for (let d = $pos.depth; d >= 0; d--) {
			let from = after ? $pos.indexAfter(d) : $pos.index(d);
			let to = from;
			const node = $pos.node(d);
			if (!found) {
				if (d == $pos.depth) {
					if ($pos.nodeAfter?.type.name == "_") {
						to += 1;
					}
					if ($pos.nodeBefore?.type.name == "_") {
						from -= 1;
					}
				}
				if (node.canReplaceWith(from, to, nodeType)) {
					// check context
					found = true;
					ret.node = node;
					ret.depth = d;
					ret.from = from;
					ret.to = to;
					if (!context) {
						contextOk = true;
						break;
					}
				} else if (!all && !node.isTextblock) {
					if (node.type.spec.typeName) break; // we only check one parent block
				}
			}
			if (found && context) {
				if (Utils.checkContext(context, node.type, d >= $pos.depth - 1)) {
					contextOk = true;
					break;
				}
			}
		}
		if (!contextOk || !found) return {};
		return ret;
	}

	static parseContext(context) {
		if (!context) return;
		return context.split('|').map(str => {
			const pc = str.trim().split('/');
			pc.pop();
			return pc;
		});
	}

	static checkContext(list, type, last) {
		// does not check nested contexts
		const cands = type.spec.group ? type.spec.group.split(' ') : [];
		cands.push(type.name);
		return list.some(pc => {
			const last = pc[pc.length - 1];
			if (!last) {
				if (pc.length == 2 && cands.includes(pc[0])) {
					return true;
				} else {
					return false;
				}
			} else if (cands.includes(last) && last) {
				return true;
			} else {
				return false;
			}
		});
	}

	nextInsertPoint(tr, from, nodeType, dir, around) {
		let cur = from + dir;
		let ret;
		let $pos;
		const doc = tr.doc;
		const docSize = doc.content.size;
		let npos = null;
		const all = !around;
		while (cur >= 0 && cur <= docSize) {
			$pos = doc.resolve(cur);
			ret = this.canInsert($pos, nodeType, all, dir > 0);
			if (ret.depth != null && ret.depth >= 0) {
				npos = dir == 1 ? $pos.after(ret.depth + 1) : $pos.before(ret.depth + 1);
				if (dir > 0 && $pos.nodeBefore?.type.name == "_"
					|| dir < 0 && $pos.nodeAfter?.type.name == "_") {
					// jumped over a placeholder
					npos = null;
					cur = cur + dir;
					continue;
				}
			}
			if (npos != null) break;
			if (!around) {
				if (dir == 1 && $pos.nodeAfter) break;
				else if (dir == -1 && $pos.nodeBefore) break;
			}
			cur = cur + dir;
		}
		return npos;
	}

	move(tr, dir, jump, check) {
		const sel = tr.selection;
		let node = sel.node;
		if (!node) return;
		if (node.type.name == "_") return;
		tr.delete(sel.from, sel.to);
		let cur = sel.from;
		const $cur = tr.doc.resolve(cur);
		let around = true;
		if (jump) {
			if (dir > 0 && $cur.nodeAfter) {
				cur += $cur.nodeAfter.nodeSize - 1;
				around = false;
			} else if (dir < 0 && $cur.nodeBefore) {
				cur -= $cur.nodeBefore.nodeSize - 1;
				around = false;
			}
		}
		let pos = null, $pos = null;
		while (pos == null) {
			pos = this.nextInsertPoint(tr, cur, node.type, dir, around);
			if (pos == null) break;
			$pos = tr.doc.resolve(pos);
		}
		if (check) return pos == null ? null : tr;
		node = node.cut(0);
		pos = this.insertTrNode(tr, pos, node);
		if (tr.doc.content.size > 0) {
			$pos = tr.doc.resolve(pos);
			if ($pos.nodeAfter) tr.setSelection(new NodeSelection($pos));
		}
		return tr;
	}

	markActive(sel, nodeType) {
		const state = this.view.state;
		if (sel.empty) {
			return nodeType.isInSet(state.storedMarks || sel.$from.marks());
		} else {
			return state.doc.rangeHasMark(sel.from, sel.to, nodeType);
		}
	}

	toggleMark(type, attrs) {
		return toggleMark(type, attrs);
	}

	extendUpdateMark(tr, from, to, mark, attrs) {
		let hadIt = false;
		if (from != to && tr.doc.rangeHasMark(from, to, mark)) {
			hadIt = true;
		}
		while (tr.doc.rangeHasMark(from - 1, from, mark)) {
			hadIt = true;
			from--;
		}
		while (tr.doc.rangeHasMark(to, to + 1, mark)) {
			hadIt = true;
			to++;
		}
		if (hadIt && attrs) {
			tr.removeMark(from, to, mark);
			mark = mark.type.create(attrs);
			tr.addMark(from, to, mark);
		}
		return [from, to];
	}

	serializeHTML(dom, children) {
		let html;
		if (dom instanceof Node) {
			if (children || dom instanceof DocumentFragment) {
				html = "";
				let child;
				for (let i = 0; i < dom.childNodes.length; i++) {
					child = dom.childNodes[i];
					if (child.nodeType == Node.TEXT_NODE) html += child.nodeValue;
					else html += child.outerHTML;
				}
			} else {
				if (dom.nodeName == "TEMPLATE" && dom.content.childNodes.length && dom.childNode.length == 0) {
					dom = dom.cloneNode(true);
					dom.appendChild(dom.content);
				}
				html = dom.outerHTML;
			}
		} else {
			html = dom;
		}
		return html;
	}

	static wrapMap = {
		thead: ["table"],
		tbody: ["table"],
		tfoot: ["table"],
		caption: ["table"],
		colgroup: ["table"],
		col: ["table", "colgroup"],
		tr: ["table", "tbody"],
		td: ["table", "tbody", "tr"],
		th: ["table", "tbody", "tr"]
	};

	static offdoc = document.cloneNode(false);

	parseHTML(html) {
		const metas = /(\s*<meta [^>]*>)*/.exec(html);
		if (metas) {
			html = html.slice(metas[0].length);
		}
		const firstTag = /(?:<meta [^>]*>)*<([a-z][^>\s]+)/i.exec(html);
		let elt = Utils.offdoc.createElement("div");
		let wrap;
		let depth = 0;

		if ((wrap = firstTag && Utils.wrapMap[firstTag[1].toLowerCase()])) {
			html = wrap.map(n => `<${n}>`).join("")
				+ html
				+ wrap.map(n => `</${n}>`).reverse().join("");
			depth = wrap.length;
		}
		elt.innerHTML = html;
		for (let i = 0; i < depth; i++) {
			elt = elt.firstChild;
		}

		return elt;
	}
}
