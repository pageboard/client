import { NodeSelection } from "prosemirror-state";

export default class FocusPlugin {
	constructor() {
		this.click = this.click.bind(this);
		this.appendTransaction = this.appendTransaction.bind(this);
		this.props = {
			handleClick: this.click
		};
	}

	view(editor) {
		this.editor = editor;
		return {};
	}

	appendTransaction(transactions, oldState, newState) {
		// focus once per transaction
		const onlyPointer = transactions.every(tr => tr.getMeta('pointer'));
		if (onlyPointer) return;
		const editorUpdate = transactions.some(tr => {
			return !tr.getMeta('focus') && tr.getMeta('editor');
		});
		const tr = newState.tr;
		if (this.action(tr, editorUpdate)) {
			return tr;
		}
	}

	click(view, pos, e) {
		const tr = view.state.tr;
		let sel = tr.selection;
		let custom = false;
		if (!e.ctrlKey) {
			let dom = e.target;
			if (dom.pmViewDesc?.node?.isLeaf) {
				custom = true; // prevents falling on the right side of the leaf node
			} else if (dom.children.length == 1 && dom.firstElementChild.matches('pagecut-placeholder')) {
				custom = true;
			} else while ((!dom.pmViewDesc || dom.pmViewDesc.node?.type.spec.typeName == "const") && !dom.hasAttribute('block-content') && !dom.hasAttribute('block-type')) {
				dom = dom.closest('[block-type]');
				custom = true;
			}
			if (custom && dom) {
				pos = view.utils.posFromDOM(dom);
				sel = NodeSelection.create(tr.doc, pos);
			} else {
				custom = false;
			}
		}
		if (this.focus(tr, sel)) {
			view.dispatch(tr);
			return custom;
		}
	}

	action(tr, editorUpdate) {
		const sel = tr.selection;
		// avoid unneeded changes
		if (this.editor.state.tr.selection.eq(sel) && !editorUpdate) return false;
		return this.focus(tr, sel);
	}

	focusRoot(tr, pos, node, focus) {
		const attrs = { ...node.attrs };
		const prev = attrs.focused;
		if (prev == focus) {
			return;
		}
		if (node.type.defaultAttrs.focused === null) {
			if (focus) attrs.focused = focus;
			else attrs.focused = null;
		}
		if (node.type.name == tr.doc.type.name) {
			tr.setDocAttribute('focused', attrs.focused);
		} else if (node.type.spec.inline && !node.type.spec.element.leaf) {
			const sel = this.editor.utils.selectTr(tr, pos);
			tr.removeMark(sel.from, sel.to, node.type);
			tr.addMark(sel.from, sel.to, node.type.create(attrs));
		} else {
			tr.setNodeMarkup(pos, null, attrs);
		}
	}

	focus(tr, sel) {
		const parents = this.editor.utils.selectionParents(tr, sel);
		const firstParent = parents.length && parents[0];
		const root = firstParent.root;
		const rootPos = root?.level && root.rpos.before(root.level);

		const me = this;

		const changes = [{
			pos: 0,
			node: tr.doc,
			focus: "zero"
		}];

		if (root) {
			changes.push({
				pos: rootPos,
				node: root.node,
				focus: "last"
			});
			let parent, cur;
			for (let i = 1; i < parents.length; i++) {
				parent = parents[i];
				cur = parent.root;
				if (!cur.level) continue;
				changes.push({
					pos: cur.rpos.before(cur.level),
					node: cur.node,
					focus: i == parents.length - 2 ? "first" : "middle"
				});
			}
		}
		function hasChanged(node, pos) {
			if (node.type.spec.typeName != "root") return;
			const changed = changes.some(obj => obj.node == node);
			if (!changed && node.attrs.focused) {
				changes.unshift({
					pos, node
				});
			}
		}

		tr.doc.descendants(hasChanged);

		for (const change of changes) {
			try {
				me.focusRoot(tr, change.pos, change.node, change.focus);
			} catch (ex) {
				console.error(ex);
			}
		}
		if (root) {
			if (sel.node && sel.from === rootPos) {
				tr.setSelection(NodeSelection.create(tr.doc, rootPos));
			}
		}
		return tr.setMeta('focus', true);
	}
}
