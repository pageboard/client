(function(Pageboard) {

Pageboard.Controls.Move = Move;

function Move(editor, node) {
	this.editor = editor;
	this.node = node;
	this.click = this.click.bind(this);
	this.node.addEventListener('click', this.click);
	this.update();
}

Move.prototype.click = function(e) {
	var item = e.target.closest('[data-command]');
	if (!item || item.matches('.disabled')) return;
	var command = item.dataset.command;
	var tr = this.editor.state.tr;
	switch (command) {
	case "left-jump":
		if (!this.editor.utils.move(tr, -1, true)) return;
		break;
	case "left":
		if (!this.editor.utils.move(tr, -1)) return;
		break;
	case "right":
		if (!this.editor.utils.move(tr, 1)) return;
		break;
	case "right-jump":
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
};

Move.prototype.destroy = function() {
	this.node.removeEventListener('click', this.click);
};

Move.prototype.update = function(parents, sel) {
	this.node.classList.toggle('hidden', !sel || !sel.node);
	var state = this.editor.state;
	var utils = this.editor.utils;
	this.node.querySelector('[data-command="left-jump"]')
	.classList.toggle('disabled', !utils.move(state.tr, -1, true));
	this.node.querySelector('[data-command="left"]')
	.classList.toggle('disabled', !utils.move(state.tr, -1));
	this.node.querySelector('[data-command="right"]')
	.classList.toggle('disabled', !utils.move(state.tr, 1));
	this.node.querySelector('[data-command="right-jump"]')
	.classList.toggle('disabled', !utils.move(state.tr, 1, true));
	this.node.querySelector('[data-command="delete"]')
	.classList.toggle('disabled', !utils.deleteTr(state.tr));
};

})(window.Pageboard);

