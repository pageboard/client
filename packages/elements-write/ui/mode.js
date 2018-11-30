Pageboard.Controls.Mode = class Mode {
	constructor(editor, node) {
		this.editor = editor;
		this.win = editor.root.defaultView;
		this.node = node;
		this.node.addEventListener('click', this);
		this.toggle = this.toggle.bind(this);
	}
	destroy() {
		this.win.Page.unsetup(this.toggle);
	}
	handleEvent(e) {
		this.win.Page.setup(this.toggle);
	}
	toggle(state) {
		if (this.editor != Pageboard.editor) {
			this.node.removeEventListener('click', this);
			return;
		}
		this.node.classList.toggle('active');
		document.body.classList.toggle('read');
		if (!this.editor.closed) {
			var store = this.editor.controls.store;
			if (state.data.$cache) {
				delete state.data.$cache.items;
				store.flush();
				var backup = store.reset();
				state.data.$cache.item = backup.unsaved || backup.initial;
				state.data.$store = backup;
				state.save();
			}
			this.editor.close();
			state.reload();
		} else {
			this.node.removeEventListener('click', this);
			Pageboard.Editor(this.win, state);
		}
	}
};

