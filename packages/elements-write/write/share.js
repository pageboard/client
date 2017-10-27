(function(Pageboard, Pagecut) {

Pageboard.Controls.Share = Share;

function Share(editor, selector) {
	this.editor = editor;
	this.toggle = $(selector).checkbox(); // 'check' || 'uncheck'
	this.changeListener = this.change.bind(this);
	this.toggle.on('change', this.changeListener);
	this.disabled = true;
}

Share.prototype.destroy = function() {
	this.toggle.off('change');
};

Share.prototype.clear = function() {
	console.info("share.clear called");
};

Share.prototype.update = function(parents) {
	this.block = parents[0].block;
	this.toggle.checkbox(this.block.standalone ? 'check' : 'uncheck');
	var el = this.editor.element(this.block.type);
	this.disabled = !this.block.id || el.standalone || el.inplace || el.inline;
	this.toggle.checkbox(this.disabled ? 'set disabled' : 'set enabled');
};

Share.prototype.change = function() {
	if (!this.block || this.disabled) return;
	var editor = this.editor;
	var checked = this.toggle.checkbox('is checked');

	this.block.standalone = checked;
	var id = this.block.id;
	var found = false;
	var nodes = editor.blocks.domQuery(id, {all: true});

	if (nodes.length == 0) {
		if (!found) console.warn("No dom nodes found for this block", this.block);
		return;
	}
	this.ignoreNext = true;
	var tr = editor.state.tr;
	nodes.forEach(function(node) {
		editor.utils.refreshTr(tr, node, this.block);
	});
	editor.dispatch(tr);
};

})(window.Pageboard, window.Pagecut);

