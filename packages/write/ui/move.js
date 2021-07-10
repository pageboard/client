(function(Pageboard) {

Pageboard.Controls.Move = Move;

function Move(editor, node) {
	this.editor = editor;
	this.node = node;
	this.click = this.click.bind(this);
	this.node.addEventListener('click', this);
	this.update();
}

Move.prototype.handleEvent = function(e) {
	if (this[e.type]) this[e.type](e);
};

Move.prototype.click = function(e) {
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
		case "delete":
			if (!this.editor.utils.deleteTr(tr)) return;
			break;
	}
	tr.setMeta('editor', true);
	tr.scrollIntoView();
	this.editor.dispatch(tr);
	this.editor.focus();
};

Move.prototype.destroy = function() {
	this.node.removeEventListener('click', this);
};

Move.prototype.update = function(parents, sel) {
	this.node.classList.toggle('hidden', !sel || !sel.node);
	const state = this.editor.state;
	const utils = this.editor.utils;
	this.node.querySelector('[data-command="left"]')
		.classList.toggle('disabled', !utils.move(state.tr, -1, false, true));
	this.node.querySelector('[data-command="right"]')
		.classList.toggle('disabled', !utils.move(state.tr, 1, false, true));
	this.node.querySelector('[data-command="delete"]')
		.classList.toggle('disabled', !utils.deleteTr(state.tr));
};

})(window.Pageboard);

