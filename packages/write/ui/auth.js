Pageboard.Controls.Auth = class Auth {
	constructor(editor, node) {
		this.editor = editor;
		this.node = node;
		this.node.addEventListener('click', this);
	}
	handleEvent(e) {
		var item = e.target.closest('[data-command]');
		if (!item) return;
		var com = item.dataset.command;
		Page.setup(function(state) {
			if (com == "logout") {
				return Pageboard.fetch("get", "/.api/logout").then(function() {
					state.reload(true);
				});
			}
		});
	}
};

