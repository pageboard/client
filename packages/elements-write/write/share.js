(function(Pageboard, Pagecut) {

Pageboard.Controls.Share = Share;

function Share(editor, selector) {
	this.editor = editor;
	this.$node = $(selector);
	this.toggle = this.$node.find('> .checkbox').checkbox(); // 'check' || 'uncheck'

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
	var hasAncestor = parents.slice(1, -1).some(function(parent) {
		return parent.block.standalone;
	});
	var hasDescendant = false;
	parents[0].root.node.descendants(function(child) {
		if (child.attrs.block_standalone == "true") {
			hasDescendant = true;
			return false;
		}
	});
	this.$node.toggleClass('standalone-no', !!hide);
	this.$node.toggleClass('standalone-descendant', hasDescendant);
	this.$node.toggleClass('standalone-ancestor', hasAncestor);
	var disabled = hasAncestor || hasDescendant || hide;
	this.toggle.checkbox(disabled ? 'set disabled' : 'set enabled');
	this.disabled = disabled;
};

Share.prototype.change = function() {
	if (!this.block || this.disabled) return;
	var newVal = this.toggle.checkbox('is checked');
	if (newVal == this.standalone) return; // do nothing

	var editor = this.editor;
	var nodes = editor.blocks.domQuery(this.block.id, {all: true});
	if (nodes.length == 0) {
		if (!found) console.warn("No dom nodes found for this block", this.block);
		return;
	}
	var tr = editor.state.tr;
	var block = this.block;
	if (!newVal) {
		// will force attribution of new id for this block and its descendants by pagecut id-plugin
		block = editor.blocks.copy(block);
		block.focused = this.block.focused; // because copy removes focus status
		this.block = block;
	}
	block.standalone = newVal;
	nodes.forEach(function(node) {
		editor.utils.refreshTr(tr, node, block);
	});
	editor.dispatch(tr);
};

})(window.Pageboard, window.Pagecut);

