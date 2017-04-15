(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;

function Form(editor, selector) {
	this.editor = editor;
	this.$node = $(selector);
	this.template = this.$node.html();
	this.clear();
	this.$node.on('change input', Throttle(this.change.bind(this), 25));
}

Form.prototype.clear = function() {
	if (this.href) {
		this.href.destroy();
		delete this.href;
	}
	this.$node.empty();
	delete this.block;
};

Form.prototype.update = function(parents) {
	if (this.ignore) return;
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
	if (info.content && !(this.editor.state.selection instanceof this.editor.root.defaultView.Pagecut.State.AllSelection)) {
		this.clear();
		return;
	}

	var el = this.editor.map[block.type];
	if (!el) {
		this.$node.html(this.template);
		return;
	}
	if (this.block && this.block.id == block.id) {
		return;
	}
	this.clear();

	var node = this.$node[0];

	this.form = new Semafor({
		type: 'object',
		properties: el.properties,
		required: el.required
	}, node);

	this.form.set(block.data);
	this.block = block;

	Object.keys(el.properties).forEach(function(key) {
		if (el.properties[key].format == "uri") {
			this.href = new Pageboard.Href(node.querySelector('[name="'+key+'"]'));
		}
	}.bind(this));
};

Form.prototype.change = function() {
	if (!this.block) return;
	var data = this.form.get();
	this.block.data = Object.assign(this.block.data || {}, data);
	this.editor.modules.id.set(this.block);


	if (this.block.type == "page") {
		this.editor.pageUpdate(this.block);
		return;
	}
	var id = this.block.id;
	var nodes = this.editor.dom.querySelectorAll('[block-id="' + id + '"]');

	if (nodes.length == 0) {
		console.warn("No block nodes found for id", id);
		this.clear();
		return;
	}

	var tr = this.editor.state.tr, curtr, count = 0;
	for (var i=0; i < nodes.length; i++) {
		curtr = this.editor.replaceTr(tr, this.block, nodes[i], true);
		if (!curtr) {
			console.warn("Cannot update", nodes[i]);
		} else {
			count++;
			tr = curtr;
		}
	}
	if (count) {
		tr.ignoreUpdate = true;
		this.editor.dispatch(tr);
	}
};

})(window.Pageboard, window.Pagecut);

