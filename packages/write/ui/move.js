Pageboard.Controls.Move = class Move {

	constructor(editor, node) {
		this.editor = editor;
		this.node = node;
		this.click = this.click.bind(this);
		this.node.addEventListener('click', this);
	}

	handleEvent(e) {
		if (this[e.type]) this[e.type](e);
	}

	click(e) {
		const item = e.target.closest('[data-command]');
		if (!item || item.matches('.disabled')) return;
		const command = item.dataset.command;
		const tr = this.editor.state.tr;
		switch (command) {
			case "left":
				if (!this.editor.utils.move(tr, -1, false)) return;
				break;
			case "right":
				if (!this.editor.utils.move(tr, 1, false)) return;
				break;
			case "jump-left":
				if (!this.editor.utils.move(tr, -1, true)) return;
				break;
			case "jump-right":
				if (!this.editor.utils.move(tr, 1, true)) return;
				break;
			case "delete":
				if (!this.editor.utils.deleteTr(tr)) return;
				break;
		}
		tr.setMeta('editor', true);
		tr.scrollIntoView();
		this.editor.dispatch(tr);
		this.editor.focus();
	}

	destroy() {
		this.node.removeEventListener('click', this);
	}

	update(parents, sel) {
		this.node.classList.remove('hidden');
		this.node.classList.toggle('inline', !sel.node);
		if (sel.node) {
			const { state, utils } = this.editor;
			this.node.querySelector('[data-command="left"]')
				.classList.toggle('disabled', !utils.move(state.tr, -1, false, true));
			this.node.querySelector('[data-command="right"]')
				.classList.toggle('disabled', !utils.move(state.tr, 1, false, true));
			this.node.querySelector('[data-command="jump-left"]')
				.classList.toggle('disabled', !utils.move(state.tr, -1, true, true));
			this.node.querySelector('[data-command="jump-right"]')
				.classList.toggle('disabled', !utils.move(state.tr, 1, true, true));
			this.node.querySelector('[data-command="delete"]')
				.classList.toggle('disabled', !utils.deleteTr(state.tr));
		}
	}
};
