(function(Pageboard, Pagecut) {

Pageboard.Form = Form;

function Form(selector) {
	this.$form = $(selector);
	this.replacing = false;
}

Form.prototype.clear = function() {
	this.$form.empty();
	this.replacing = false;
};

Form.prototype.update = function(editor, block) {
	if (this.replacing) return;
	this.clear();
	if (!block) return;
	var el = editor.map[block.type];
	if (!el) {
		// TODO display this block has no data to be edited
		return;
	}
	var form = new Semafor({
		type: 'object',
		properties: el.properties,
		required: el.required
	}, this.$form[0]);

	form.set(block.data);
	var me = this;
	form.$node.on('change', function() {
		var data = form.get();
		Object.assign(block.data, data);
		var blockNode = editor.view.dom.querySelector('[block-id="' + block.id + '"]');
		if (!blockNode) {
			me.clear();
			return;
		}
		editor.modules.id.set(block);
		me.replacing = true;
		editor.replace(blockNode, block);
		me.replacing = false;
	});
};

})(window.Pageboard, window.Pagecut);

