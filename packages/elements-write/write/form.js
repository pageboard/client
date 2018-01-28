(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;


function Form(editor, node) {
	this.editor = editor;
	this.node = node;
}

Form.prototype.destroy = function() {
	if (this.main) {
		this.main.destroy();
		this.main = null;
	}
	if (this.markForms) {
		this.markForms.forEach(function(markForm) {
			markForm.destroy();
		});
		this.markForms = null;
	}
};

Form.prototype.update = function(parents) {
	if (this.ignoreNext) {
		this.ignoreNext = false;
		return;
	}
	if (!parents.length) {
		this.clear();
		return;
	}
	var parent = parents[0];

	var block = parent.block;
	if (!block) {
		this.destroy();
		return;
	}

	if (this.main && block != this.main.block) {
		this.destroy();
	}

	if (!this.main) this.main = new FormBlock(this.editor, this.node, block);
	this.main.update();

	var marks = parent.marks;
	if (this.markForms) this.markForms.forEach(function(form) {
		form.destroy();
	});
	this.markForms = (parent.marks || []).map(function(block) {
		var form = new FormBlock(this.editor, this.node, block);
		form.update();
		return form;
	}, this);
};

function FormBlock(editor, parent, block) {
	this.node = parent.appendChild(document.createElement('div'));
	this.block = block;
	this.editor = editor;
	this.el = editor.element(block.type);
	if (!this.el) {
		throw new Error(`Unknown element type ${block.type}`);
	}
	this.changeListener = this.change.bind(this);
	this.node.addEventListener('change', this.changeListener);
	this.node.addEventListener('input', this.changeListener);
	this.form = new Semafor({
		type: 'object',
		properties: this.el.properties,
		required: this.el.required
	}, this.node);
	this.inputs = {};
	if (this.el.properties) this.propInputs(this.el.properties);
}

FormBlock.prototype.destroy = function() {
	if (this.inputs) for (var name in this.inputs) {
		if (this.inputs[name].destroy) this.inputs[name].destroy();
	}
	this.inputs = {};
	this.node.removeEventListener('change', this.changeListener);
	this.node.removeEventListener('input', this.changeListener);
	this.node.remove();
};

FormBlock.prototype.update = function() {
	this.ignoreEvents = true;
	this.form.set(this.block.data);
	this.ignoreEvents = false;
};

FormBlock.prototype.propInputs = function(props, parentKey) {
	var node = this.node;
	var block = this.block;
	Object.keys(props).forEach(function(key) {
		var prop = props[key];
		var opts = prop.input;
		if (!opts || !opts.name) {
			if (prop.properties) this.propInputs(prop.properties, key);
			return;
		}
		var CurInput = Pageboard.inputs[opts.name];
		if (!CurInput) {
			console.error("Unknown input name", Pageboard.inputs, prop);
			return;
		}
		var ikey = key;
		if (parentKey) ikey = `${parentKey}.${key}`;
		if (!this.inputs[ikey]) {
			this.inputs[ikey] = new CurInput(node.querySelector(`[name="${ikey}"]`), opts, prop, block);
		} else {
			this.inputs[ikey].update(block);
		}
	}, this);
};

FormBlock.prototype.change = function() {
	if (!this.block || this.ignoreEvents) return;
	var editor = this.editor;
	var data = this.form.get();

	var id = this.block.id;
	var found = false;

	// this must be done after reselecting with breadcrumb.click
	this.block.data = Object.assign(this.block.data || {}, data);

	if (id == editor.state.doc.attrs.id) {
		found = true;
		editor.pageUpdate(this.block);
	}

	if (this.el.inplace) {
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

