(function(Pageboard) {
Pageboard.Breadcrumb = Breadcrumb;

function Breadcrumb(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
	this.template = this.$node[0].cloneNode(true);
	this.clear();
	this.$node.on('click', 'a', this.click.bind(this));
}

Breadcrumb.prototype.update = function(parents) {
	this.clear();
	for (var i = parents.length - 1; i >= 0; i--) {
		var block = parents[i].block;
		this.$node.append(this.item(block));
	}
};

Breadcrumb.prototype.clear = function() {
	this.$node.empty();
	var node = this.template.cloneNode(true);
	$(node).find('a').remove();
	this.$node.append(node);
};

Breadcrumb.prototype.item = function(block) {
	var node = this.template.cloneNode(true);
	var anchor = node.querySelector('a');
	anchor.textContent = this.editor.map[block.type].title;
	anchor.setAttribute('block-id', block.id);
	return node;
}

Breadcrumb.prototype.click = function(e) {
	var id = e.target.getAttribute('block-id');
	var node = this.editor.view.root.querySelector('[block-id="'+id+'"]');
	if (!node) console.warn("block node not found", id);
	var sel = this.editor.select(node, true);
	if (sel) {
		this.editor.view.dispatch(this.editor.view.state.tr.setSelection(sel));
		this.editor.view.focus();
	}
};

})(window.Pageboard);

