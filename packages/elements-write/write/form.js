(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;

function Form(editor, selector) {
	this.editor = editor;
	this.$node = $(selector);
	this.clear();
	this.changeListener = Throttle(this.change.bind(this), 50);
}

Form.prototype.clear = function() {
	if (this.inputs) for (var name in this.inputs) {
		if (this.inputs[name].destroy) this.inputs[name].destroy();
	}
	this.inputs = {};
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

	this.$node.off('change input', this.changeListener);

	if (block != this.block) this.clear();

	this.type = info.type;

	var node = this.$node[0];

	if (!this.form) {
		this.form = new Semafor({
			type: 'object',
			properties: el.properties,
			required: el.required
		}, node);
	}

	this.form.set(block.data);
	this.block = block;

	if (el.properties) Object.keys(el.properties).forEach(function(key) {
		var props = el.properties[key];
		var opts = props.input;
		if (!opts || !opts.name) return;
		var CurInput = Pageboard.inputs[opts.name];
		if (!CurInput) {
			console.error("Unknown input name", Pageboard.inputs, opts, el);
			return;
		}
		if (!this.inputs[key]) {
			this.inputs[key] = new CurInput(node.querySelector(`[name="${key}"]`), opts);
		} else {
			this.inputs[key].change();
		}
	}.bind(this));
	this.$node.on('change input', this.changeListener);
};

Form.prototype.change = function() {
	if (!this.block) return;
	var editor = this.editor;
	var data = this.form.get();

	var id = this.block.id;
	var found = false;
	if (id == editor.state.doc.attrs.block_id) {
		found = true;
		editor.pageUpdate(this.block);
	}

	// this must be done after reselecting with breadcrumb.click
	this.block.data = Object.assign(this.block.data || {}, data);

	var el = editor.element(this.type);
	if (el.inplace) {
		// simply select focused node
		var node = editor.root.querySelector('[block-focused="last"]');
		if (node) {
			this.ignoreNext = true;
			editor.utils.refresh(node, this.block);
		}
		return;
	}
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

