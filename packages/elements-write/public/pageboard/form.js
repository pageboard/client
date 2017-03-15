(function(Pageboard, Pagecut) {

Pageboard.Form = Form;

function Form(editor, selector) {
	this.editor = editor;
	this.$node = $(selector);
	this.template = this.$node.html();
	this.clear();
}

Form.prototype.clear = function() {
	this.$node.empty();
	this.$node.off('change');
	this.replacing = false;
};

Form.prototype.update = function(parents) {
	if (this.replacing) return;
	this.clear();
	if (!parents.length) return;
	var info = parents[0];
	var block = info.block;
	if (!block) return;
	var el = this.editor.map[block.type];
	if (!el) {
		this.$node.html(this.template);
		return;
	}
	this.form = new Semafor({
		type: 'object',
		properties: el.properties,
		required: el.required
	}, this.$node[0]);

	this.form.set(block.data);
	this.block = block;
	this.$node.on('change', this.change.bind(this, info, el));
};

Form.prototype.change = function(info, el) {
	var block = info.block;
	var data = this.form.get();
	Object.assign(block.data, data);
	this.editor.modules.id.set(block);
	var view = this.editor.view;
	var blockNode = view.dom.querySelector('[block-id="' + block.id + '"]');
	if (!blockNode) {
		console.error("blockNode was not found");
		this.clear();
		return;
	}
	this.replacing = true;
	var oldSel = view.state.tr.selection; // do we need to copy that ?
	this.editor.replace(block, blockNode);
	view.dispatch(view.state.tr.setSelection(oldSel));
	this.replacing = false;
};

})(window.Pageboard, window.Pagecut);

