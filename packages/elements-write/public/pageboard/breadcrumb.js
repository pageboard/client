(function(Pageboard) {
Pageboard.Breadcrumb = Breadcrumb;

function Breadcrumb(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
	this.template = this.$node[0].cloneNode(true);
	this.$node.empty();
	this.$node.on('click', 'a', this.click);
}

Breadcrumb.prototype.update = function(parents) {
	this.$node.empty();
	for (var i=0; i < parents.length; i++) {
		var block = parents[i].block;
		this.$node.append(this.item(block));
	}
};

Breadcrumb.prototype.item = function(block) {
	var node = this.template.cloneNode(true);
	var anchor = node.querySelector('a');
	anchor.textContent = this.editor.map[block.type].title;
	anchor.setAttribute('block-id', block.id);
	return node;
}

Breadcrumb.prototype.click = function(e) {
	console.log('clicked breadcrumb item pointing to block-id', this.getAttribute('block-id'));
};

})(window.Pageboard);

