Pageboard.Controls.Share = class Share {
	constructor(editor, node) {
		this.editor = editor;
		this.node = node;
		this.toggle = node.querySelector('input[name="standalone"]');
		this.toggle.addEventListener('change', this);
		this.disabled = true;
	}

	handleEvent(e) {
		this.change();
	}

	update(parents) {
		this.block = parents[0].block;
		this.disabled = true;
		const el = this.editor.element(this.block.type);
		this.standalone = this.block.standalone || el.standalone;
		this.toggle.checked = this.standalone;
		const hide = !this.block.id || el.inplace || el.inline;
		const hasAncestor = !this.standalone && parents.slice(1, -1).some((parent) => {
			return parent.block.standalone;
		});
		let hasDescendant = false;
		if (!this.standalone) parents[0].node.descendants((child) => {
			if (child.attrs.standalone == "true") {
				hasDescendant = true;
				return false;
			}
		});
		this.node.classList.toggle('standalone-no', Boolean(hide));
		this.node.classList.toggle('standalone-descendant', hasDescendant);
		this.node.classList.toggle('standalone-ancestor', hasAncestor);
		const disabled = hasAncestor || hasDescendant || hide || el.standalone || el.virtual;
		this.toggle.disabled = this.disabled = disabled;
	}

	change() {
		if (!this.block || this.disabled) return;
		const newVal = this.toggle.checked;
		this.editor.blocks.setStandalone(this.block, newVal);
	}

	destroy() {
		this.toggle.removeEventListener('change', this);
	}
};

