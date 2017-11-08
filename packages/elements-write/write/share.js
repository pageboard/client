(function(Pageboard, Pagecut) {

Pageboard.Controls.Share = Share;

function Share(editor, selector) {
	this.editor = editor;
	this.toggle = $(selector).checkbox(); // 'check' || 'uncheck'
	this.parentItem = this.toggle.closest('.item');
	this.changeListener = this.change.bind(this);
	this.toggle.on('change', this.changeListener);
	this.disabled = true;
}

Share.prototype.update = function(parents) {
	this.block = parents[0].block;
	this.disabled = true;
	this.standalone = this.block.standalone;
	this.toggle.checkbox(this.standalone ? 'set checked' : 'set unchecked');
	var el = this.editor.element(this.block.type);
	var hide = !this.block.id || el.standalone || el.inplace || el.inline;
	this.parentItem.toggle(!hide);
	var disabled = false;
	this.toggle.checkbox(disabled ? 'set disabled' : 'set enabled');
	this.disabled = disabled;
};

Share.prototype.change = function() {
	if (!this.block || this.disabled) return;
	this.block.standalone = this.toggle.checkbox('is checked');
	if (this.block.standalone == this.standalone) return; // do nothing

	var editor = this.editor;
	var nodes = editor.blocks.domQuery(this.block.id, {all: true});
	if (nodes.length == 0) {
		if (!found) console.warn("No dom nodes found for this block", this.block);
		return;
	}
	var tr = editor.state.tr;
	if (!this.block.standalone) {
		delete this.block.id;
		editor.blocks.set(this.block);
	}
	nodes.forEach(function(node) {
		editor.utils.refreshTr(tr, node, this.block);
	});
	editor.dispatch(tr);
};

})(window.Pageboard, window.Pagecut);

