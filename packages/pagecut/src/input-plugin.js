const State = require("prosemirror-state");
const Model = require("prosemirror-model");

module.exports = class InputPlugin {
	constructor() {
		this.clipboardTextParser = this.clipboardTextParser.bind(this);
		this.transformPasted = this.transformPasted.bind(this);
		this.handlePaste = this.handlePaste.bind(this);
	}

	view(editor) {
		this.editor = editor;
		return {};
	}
	handlePaste(view, e, slice) {
		// TODO find insert point using e.
	}

	handleTextInput(view, from, to, text) {
		const tr = view.state.tr;
		// return true to disable default insertion
		const parents = view.utils.selectionParents(tr, { from: from, to: to });
		if (!parents.length) return true;
		const parent = parents[0];
		const root = parent.container || parent.root;
		if (tr.selection.node && tr.selection.node.isTextblock) {
			// change selection to be inside that node
			view.dispatch(
				tr.setSelection(
					State.Selection.near(tr.selection.$from)
				)
			);
			return false;
		}
		if (root && root.node && (root.node.isTextblock || root.node.type.name == "_") || parent.inline) {
			// it should be all right then
			return false;
		}
		return true;
	}

	transformPasted(slice) {
		let sParent;
		// TODO can't paste standalone from another site
		slice.content.descendants((node, pos, parent) => {
			const focusable = node.type.defaultAttrs.focused === null;
			if (focusable) node.attrs.focused = null;
			const sa = node.attrs.standalone;
			if (sa) sParent = parent;
			else if (sParent && sParent == parent) sParent = null;
			const id = node.attrs.id;
			if (id) {
				const block = this.editor.blocks.get(id);
				if (!block && !sa && !sParent) {
					// not a standalone or not a child of one
					delete node.attrs.id;
				}
				if (block && focusable) {
					delete block.focused;
				}
			}
		});
		return slice;
	}

	clipboardTextParser(str, $pos) {
		if (str instanceof Model.Slice) {
			return str;
		}
		const type = $pos.parent && $pos.parent.type.name || '';
		let dom;
		if (type.startsWith('svg')) {
			dom = (new DOMParser()).parseFromString(str, "image/svg+xml");
		} else {
			dom = this.editor.utils.parseHTML(str);
		}
		return this.editor.someProp("clipboardParser").parseSlice(dom, {
			preserveWhitespace: true,
			context: $pos
		});
	}
};
