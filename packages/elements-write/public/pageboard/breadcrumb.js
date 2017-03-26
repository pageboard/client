(function(Pageboard) {
Pageboard.Breadcrumb = Breadcrumb;

function Breadcrumb(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
	this.template = this.$node[0].cloneNode(true);
	this.clear();
	this.$node.on('click', '.section', this.click.bind(this));
}

Breadcrumb.prototype.update = function(parents) {
	this.clear();
	var parent;
	for (var i = parents.length - 1; i >= 0; i--) {
		parent = parents[i];
		this.$node.append(this.item(parent.block));
	}
	if (parent && parent.content && parent.content.name) {
		var contentTitle = this.editor.map[parent.block.type].contents[parent.content.name].title;
		if (contentTitle) {
			this.$node.append($('<span class="section">' + contentTitle + '</span>'));
		}
	}
	this.$node.find('.section').last().addClass('active').next('.divider').remove();
};

Breadcrumb.prototype.clear = function() {
	this.$node.empty();
};

Breadcrumb.prototype.item = function(block) {
	var node = this.template.cloneNode(true);
	var item = node.querySelector('.section');
	item.textContent = this.editor.map[block.type].title;
	item.setAttribute('block-id', block.id);
	return node.innerHTML;
}

Breadcrumb.prototype.click = function(e) {
	var id = e.target.getAttribute('block-id');
	var nodes = this.editor.view.root.querySelectorAll('[block-focused][block-id="'+id+'"]');
	if (nodes.length == 0) {
		console.warn("No block nodes found for id", id);
		return;
	}
	if (nodes.length > 1) {
		console.warn("Only one node should have focus and id", id);
		return;
	}
	var sel = this.editor.select(nodes[0]);
	if (sel) {
		this.editor.view.dispatch(this.editor.view.state.tr.setSelection(sel));
		this.editor.view.focus();
	}
};

})(window.Pageboard);

