/* global $ */
Pageboard.Controls.Share = class Share {
	constructor(editor, node) {
		this.editor = editor;
		this.node = node;
		this.toggle = $(node).find('> .checkbox').checkbox(); // 'check' || 'uncheck'

		this.changeListener = this.change.bind(this);
		this.toggle.on('change', this.changeListener);
		this.disabled = true;
	}

	update(parents) {
		this.block = parents[0].block;
		this.disabled = true;
		const el = this.editor.element(this.block.type);
		this.standalone = this.block.standalone || el.standalone;
		this.toggle.checkbox(this.standalone ? 'set checked' : 'set unchecked');
		const hide = !this.block.id || el.inplace || el.inline;
		const hasAncestor = !this.standalone && parents.slice(1, -1).some(function (parent) {
			return parent.block.standalone;
		});
		let hasDescendant = false;
		if (!this.standalone) parents[0].node.descendants(function (child) {
			if (child.attrs.standalone == "true") {
				hasDescendant = true;
				return false;
			}
		});
		this.node.classList.toggle('standalone-no', !!hide);
		this.node.classList.toggle('standalone-descendant', hasDescendant);
		this.node.classList.toggle('standalone-ancestor', hasAncestor);
		const disabled = hasAncestor || hasDescendant || hide || el.standalone || el.virtual;
		this.toggle.checkbox(disabled ? 'set disabled' : 'set enabled');
		this.disabled = disabled;
	}

	change() {
		if (!this.block || this.disabled) return;
		const newVal = this.toggle.checkbox('is checked');
		this.editor.blocks.setStandalone(this.block, newVal);
	}
};

