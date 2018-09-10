(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;

function Form(editor, node) {
	this.editor = editor;
	this.node = node;
	this.inlines = [];
}

Form.prototype.destroy = function() {
	if (this.main) {
		this.main.destroy();
		delete this.main;
	}
	this.inlines.forEach(function(form) {
		form.destroy();
	});
	this.inlines = [];
};

Form.prototype.update = function(parents, sel) {
	if (this.ignoreNext) {
		this.ignoreNext = false;
		return;
	}
	if (!parents.length) {
		this.destroy();
		return;
	}
	var parent = parents[0];

	var block = parent.block;
	if (!block) {
		this.destroy();
		return;
	}

	if (this.main && block != this.main.block) {
		this.main.destroy();
		delete this.main;
	}

	if (!this.main) this.main = new FormBlock(this.editor, this.node, block);
	this.main.update(parents);

	var curInlines = this.inlines;
	var inlines = (parent.inline && parent.inline.blocks || []).map(function(block) {
		var curForm;
		curInlines = curInlines.filter(function(form) {
			if (form.block.type == block.type) {
				curForm = form;
				return false;
			} else {
				return true;
			}
		});
		if (!curForm) {
			curForm = new FormBlock(this.editor, this.node, block);
		} else {
			curForm.node.parentNode.appendChild(curForm.node);
		}
		curForm.update(parents, block);
		return curForm;
	}, this);
	curInlines.forEach(function(form) {
		form.destroy();
	});
	this.inlines = inlines;
};

function FormBlock(editor, node, block) {
	this.node = node.appendChild(document.createElement('form'));
	this.node.setAttribute('autocomplete', 'off');
	this.block = block;
	this.editor = editor;
	var el = editor.element(block.type);
	if (!el) {
		throw new Error(`Unknown element type ${block.type}`);
	}
	el = this.el = Object.assign({}, el);
	el.properties = JSON.parse(JSON.stringify(el.properties));
	this.changeListener = this.change.bind(this);
	this.node.addEventListener('change', this.changeListener);
	this.node.addEventListener('input', this.changeListener);
	this.helpers = {};
	this.filters = {};
}

FormBlock.prototype.destroy = function() {
	Object.values(this.helpers).forEach(function(inst) {
		if (inst.destroy) inst.destroy();
	});
	this.helpers = {};
	Object.values(this.filters).forEach(function(inst) {
		if (inst.destroy) inst.destroy();
	});
	this.filters = {};

	this.form.destroy();
	this.node.removeEventListener('change', this.changeListener);
	this.node.removeEventListener('input', this.changeListener);
	this.node.remove();
};

FormBlock.prototype.update = function(parents, block) {
	this.ignoreEvents = true;
	if (block) {
		this.block = block;
	}
	if (parents) {
		this.parents = parents;
	}
	var schema = Object.assign({}, this.el, {type: 'object'});
	if (!this.form) this.form = new Semafor(
		schema,
		this.node,
		this.customFilter.bind(this),
		this.customHelper.bind(this)
	);

	this.form.update();
	this.form.clear();
	this.form.set(this.block.data);
	Object.values(this.helpers).forEach(function(inst) {
		if (inst.update) inst.update(this.block);
	}, this);
	Object.values(this.filters).forEach(function(inst) {
		if (inst.update) inst.update(this.block);
	}, this);
	this.ignoreEvents = false;
};

FormBlock.prototype.customHelper = function(key, prop, node) {
	if (key && prop.context && this.parents && !this.parents.some(function(parent) {
		return prop.context.split('|').some(function(tok) {
			return parent.block.type == tok;
		});
	})) {
		var input = node.querySelector(`[name="${key}"]`);
		if (input) input.closest('.field').remove();
		return;
	}
	var opts = prop.$helper;
	if (!opts) return;
	if (typeof opts == "string") {
		opts = {name: opts};
	} else if (!opts.name) {
		console.warn("$helper without name", prop);
		return;
	}
	var Helper = Pageboard.schemaHelpers[opts.name];
	if (!Helper) {
		console.error("Unknown helper name", prop);
		return;
	}
	var inst = new Helper(node.querySelector(`[name="${key}"]`), opts, prop);
	if (inst.init) inst.init(this.block);
	this.helpers[key] = inst;
};

FormBlock.prototype.customFilter = function(key, prop) {
	var opts = prop.$filter;
	if (!opts) return;
	if (typeof opts == "string") {
		opts = {name: opts};
	} else if (!opts.name) {
		console.warn("$filter without name", prop);
		return;
	}
	var Filter = Pageboard.schemaFilters[opts.name];
	if (!Filter) {
		console.error("Unknown filter name", prop);
		return;
	}
	var inst = new Filter(key, opts, prop);
	if (inst.init) inst.init(this.block);
	this.filters[key] = inst;
};

FormBlock.prototype.change = function() {
	if (!this.block || this.ignoreEvents || !this.form) return;
	var editor = this.editor;
	var data = this.form.get();

	var id = this.block.id;
	var found = false;

	// this must be done after reselecting with breadcrumb.click
	this.block.data = Object.assign(this.block.data || {}, data);

	if (id == editor.state.doc.attrs.id) {
		found = true;
		editor.blocks.set(this.block);
		editor.controls.store.update();
		return;
//		editor.pageUpdate(this.block);
	}

	var tr = editor.state.tr;
	var dispatch = false;

	if (this.el.inplace) {
		// simply select focused node
		var node = this.el.inline ? this.parents[0].inline.rpos : editor.root.querySelector('[block-focused="last"]');
		if (node) {
			editor.utils.refreshTr(tr, node, this.block);
			dispatch = true;
		}
	} else {
		var nodes = editor.blocks.domQuery(id, {all: true});

		if (nodes.length == 0) {
			if (!found) console.warn("No dom nodes found for this block", this.block);
		} else {
			nodes.forEach(function(node) {
				editor.utils.refreshTr(tr, node, this.block);
			}, this);
			dispatch = true;
		}
	}
	if (dispatch) {
		editor.controls.form.ignoreNext = true;
		editor.dispatch(tr);
	}
};

})(window.Pageboard, window.Pagecut);

