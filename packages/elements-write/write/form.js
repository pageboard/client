(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;

function Form(editor, selector) {
	this.editor = editor;
	this.$node = $(selector);
	this.template = this.$node.html();
	this.clear();
	this.$node.on('change input', Throttle(this.change.bind(this), 50));
}

Form.prototype.clear = function() {
	if (this.href) {
		this.href.destroy();
		delete this.href;
	}
	this.$node.empty();
	delete this.block;
	delete this.form;
};

Form.prototype.update = function(parents) {
	if (this.ignore) return;
	if (this.ignoreNext) {
		this.ignoreNext = false;
		return;
	}
	if (!parents.length) {
		this.clear();
		return;
	}
	var info = parents[0];
	var block = info.block;
	if (!block) {
		this.clear();
		return;
	}

	var el = this.editor.element(info.type);
	if (!el) {
		throw new Error(`Unknown element type ${block.type}`);
		return;
	}

	if (this.block && this.block.id != block.id) this.clear();

	var node = this.$node[0];

	if (!this.form) {
		this.form = new Semafor({
			type: 'object',
			properties: el.properties,
			required: el.required
		}, node);
	}

	this.form.set(block.data);

	if (el.properties) Object.keys(el.properties).forEach(function(key) {
		// TODO make this pluggable from the element definition
		if (el.properties[key].format == "uri") {
			if (!this.href) this.href = new Pageboard.Href(node.querySelector(`[name="${key}"]`));
			else this.href.change();
		}
	}.bind(this));

	this.block = block;
};

Form.prototype.change = function() {
	if (!this.block) return;
	var editor = this.editor;
	var data = this.form.get();
	this.block.data = Object.assign(this.block.data || {}, data);
	editor.blocks.set(this.block);

	var id = this.block.id;
	var found = false;
	if (id == editor.state.doc.attrs.block_id) {
		found = true;
		editor.pageUpdate(this.block);
	}

	var nodes = editor.blocks.domQuery(id, {all: true});

	if (nodes.length == 0) {
		if (!found) console.warn("No dom nodes found for this block", this.block);
		return;
	}
	this.ignoreNext = true;
	nodes.forEach(function(node) {
		editor.utils.refresh(node);
	});
	var node = editor.blocks.domQuery(id, {focused: true});
	if (node) {
		var sel = editor.utils.select(node);
		if (sel) {
			editor.dispatch(editor.state.tr.setSelection(sel));
		}
	}
};

})(window.Pageboard, window.Pagecut);

