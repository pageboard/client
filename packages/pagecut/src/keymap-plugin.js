const {keymap} = require("prosemirror-keymap");
const State = require("prosemirror-state");

module.exports = function(editor, options) {
	return keymap({
		Enter: breakCommand,
		Delete: deleteCommand.bind(this, false),
		Backspace: deleteCommand.bind(this, true),
		"Mod-ArrowRight": moveCommand.bind(null, 1, false),
		"Mod-ArrowLeft": moveCommand.bind(null, -1, false),
		"Mod-ArrowDown": moveCommand.bind(null, 1, true),
		"Mod-ArrowUp": moveCommand.bind(null, -1, true)
	});
};

function moveCommand(dir, jump, state, dispatch, view) {
	const tr = state.tr;
	if (!tr.selection.node) return false;
	if (view.utils.move(tr, dir, jump)) {
		tr.setMeta('editor', true);
		tr.scrollIntoView();
		if (dispatch) dispatch(tr);
	}
	return true;
}

function breakCommand(state, dispatch, view) {
	const tr = state.tr;
	const sel = tr.selection;
	const bef = sel.$from.nodeBefore;
	const parent = sel.$from.parent;
	const isRoot = parent.type.spec.typeName == "root";
	let handled = false;
	if (bef && bef.type.name == "hard_break" && isRoot && parent.isTextblock) {
		tr.delete(sel.$from.pos - bef.nodeSize, sel.$from.pos).scrollIntoView();
		// ok let's handle the split ourselves
		const elt = view.element(parent.type.name);
		if (elt && !elt.inline) {
			const from = view.utils.splitTr(tr, sel.to);
			if (from != null) {
				if (from != sel.from) {
					tr.setSelection(State.Selection.near(tr.doc.resolve(from + 1)));
				}
				handled = true;
			}
		}
	} else {
		const hard_break = state.schema.nodes.hard_break;
		handled = true;
		if (view.utils.canInsert(sel.$from, hard_break).node && dispatch) {
			tr.replaceSelectionWith(hard_break.create()).scrollIntoView();
		}
	}
	if (dispatch) dispatch(tr);
	return handled;
}

function deleteCommand(back, state, dispatch, view) {
	const tr = state.tr;
	const sel = tr.selection;
	if (!sel.empty) return false;
	if (!sel.$from.parent.isTextblock) return false;
	// if selection is inside an empty paragraph, remove that paragraph
	const offFrom = back ? -1 : 0;
	const offTo = back ? 0 : 1;
	if (sel.$from.parent.childCount == 1 && sel.$from.parent.firstChild.nodeSize == 1) {
		if (dispatch) {
			dispatch(
				// .setMeta('addToHistory', true) doesn't work
				tr.delete(sel.from + offFrom, sel.from + offTo).scrollIntoView()
			);
		}
		return true;
	} else if (sel.$from.parent.childCount == 1 && sel.$from.parent.firstChild.nodeSize == 0) {
		if (dispatch) {
			dispatch(
				// .setMeta('addToHistory', true) doesn't work
				tr.delete(sel.$from.before(), sel.$from.after()).scrollIntoView()
			);
		}
		return true;
	} else if (!back) {
		const $to = sel.$to;
		if ($to.parentOffset == $to.parent.nodeSize - 2) {
			const nextNode = $to.doc.resolve($to.after()).nodeAfter;
			if (nextNode && nextNode.isTextblock) {
				if (dispatch) {
					dispatch(tr.join(sel.to + 1));
				}
				return true;
			}
		}
	} else {
		const $from = sel.$from;
		if ($from.parentOffset == 0) {
			const prevNode = $from.doc.resolve($from.before()).nodeBefore;
			if (prevNode && prevNode.isTextblock) {
				if (dispatch) {
					dispatch(tr.join(sel.from - 1));
				}
				return true;
			}
		}
	}
	return false;
}

