const { State } = require("./editor");

module.exports = function(view) {
	let count = 0;
	setInterval(function() {
		count = 0;
	}, 2000);

	return {
		view: function(view) {
			const tr = view.state.tr;
			if (processStandalone(tr, view.state.doc, 0, false)) {
				view.dispatch(tr);
			}
			return {};
		},
		appendTransaction: function(trs, oldState, newState) {
			const tr = newState.tr;
			if (count++ > 500) {
				console.error("Loop in appendTransaction for id-plugin");
				return;
			}
			if (trs.some(x => x.docChanged) && processStandalone(tr, newState.doc, 0, false)) {
				return tr;
			}
		}
	};
	function processStandalone(tr, root, offset, regen) {
		let modified = false;
		const ids = {};
		let lastMark;
		let sel = tr.selection;
		root.descendants(function(node, pos, parent) {
			pos += offset;
			if (node.type.name == "_" && parent.childCount > 1) {
				tr.delete(pos, pos + 1);
				offset += -1;
				modified = true;
				return false;
			}
			node.marks.forEach(function(mark) {
				if (lastMark && (mark.attrs.id == lastMark.attrs.id || mark.eq(lastMark))) {
					return;
				}
				const attrs = mark.attrs;
				const el = mark.type.spec.element;
				if (!el) return;
				const id = attrs.id;
				if (el.inplace && !id) return;
				lastMark = mark;
				if (id && ids[id] || !el.inplace && !id) {
					// add id attribute to the extended mark
					const block = view.blocks.fromAttrs(attrs);
					delete block.id;
					view.blocks.set(block);
					ids[block.id] = true;
					view.utils.extendUpdateMark(tr, pos, pos, mark, Object.assign({}, attrs, {
						id: block.id
					}));
					modified = true;
				} else if (id && el.inplace) {
					// remove id attribute from the extended mark
					const copy = Object.assign({}, attrs);
					delete copy.id;
					view.utils.extendUpdateMark(tr, pos, pos, mark, copy);
					modified = true;
				} else if (id) {
					ids[id] = true;
				}
			});
			if (!node.marks.length) lastMark = null;

			const attrs = node.attrs;
			const id = attrs.id;
			const type = attrs.type;
			if (!type) {
				const typeName = node.type.spec.typeName;
				if (typeName == "container" || typeName == "wrap") {
					const parentId = parent.type.spec.typeName == "root" ? parent.attrs.id : parent.attrs._id;
					if (parentId != attrs._id) {
						modified = true;
						tr.setNodeMarkup(pos, null, Object.assign({}, attrs, {_id: parentId}));
					}
				}
				return;
			}
			const el = view.element(type);
			if (!el) return;
			const standalone = attrs.standalone == "true";
			let forceGen = regen;
			const knownBlock = view.blocks.get(id);
			// Important: RootSpec parser.getAttrs works in combination with id-plugin
			if (!standalone && knownBlock && knownBlock.standalone) {
				// user changes a block to become not standalone
				forceGen = true;
			}
			const gen = id && forceGen || !standalone && !el.inplace && (!id || ids[id]);
			const rem = id && el.inplace;
			if (gen) {
				const block = view.blocks.fromAttrs(attrs);
				if (knownBlock) {
					// block.type can be overriden by attrs.type
					block.type = knownBlock.type;
				}
				delete block.id;
				view.blocks.set(block);
				const newAttrs = Object.assign({}, attrs, {
					id: block.id
				});
				if (!standalone) {
					delete newAttrs.standalone;
					block.standalone = false;
				}
				tr.setNodeMarkup(pos, null, newAttrs);
				ids[block.id] = true;
				modified = true;
			} else if (rem) {
				const copy = Object.assign({}, attrs);
				delete copy.id;
				tr.setNodeMarkup(pos, null, copy);
				modified = true;
			} else if (id) {
				ids[id] = true;
			}
			if (node.childCount && (standalone || forceGen)) {
				if (processStandalone(tr, node, pos + 1, forceGen)) {
					modified = true;
				}
				return false;
			}
		});
		if (modified) {
			if (sel.node) {
				sel = State.NodeSelection.create(tr.doc, sel.from);
			} else {
				sel = State.TextSelection.create(tr.doc, sel.from, sel.to);
			}
			tr.setSelection(sel);
		}
		return modified;
	}
};


