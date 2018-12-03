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

	if (block != this.block) {
		if (this.main) {
			this.main.destroy();
			delete this.main;
		}
		this.block = block;
	}

	if (!this.main) this.main = new FormBlock(this.editor, this.node, block.type);
	this.main.update(parents, block);

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
			curForm = new FormBlock(this.editor, this.node, block.type);
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

function FormBlock(editor, node, type) {
	this.node = node.appendChild(document.createElement('form'));
	this.node.setAttribute('autocomplete', 'off');
	this.editor = editor;
	var el = editor.element(type);
	if (!el) {
		throw new Error(`Unknown element type ${type}`);
	}
	el = this.el = Object.assign({}, el);
	if (el.properties) {
		el.properties = JSON.parse(JSON.stringify(el.properties));
	}
	this.changeListener = Pageboard.debounce(this.change.bind(this), 250);
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
	var same = false;
	if (block) {
		if (this.block) {
			same = Pageboard.JSON.stableStringify(this.block.data) == Pageboard.JSON.stableStringify(block.data);
		}
		this.block = Object.assign({}, block);
		this.block.data = JSON.parse(JSON.stringify(block.data || {}));
	}
	if (parents) {
		this.parents = parents;
	}
	if (!same) {
		var schema = Object.assign({}, this.el, {type: 'object'});
		var form = this.form;
		if (!form) form = this.form = new window.Semafor(
			schema,
			this.node,
			this.customFilter.bind(this),
			this.customHelper.bind(this)
		);
		var active = document.activeElement;
		var selection = active ? {
			name: active.name,
			start: active.selectionStart,
			end: active.selectionEnd,
			dir: active.selectionDirection
		} : null;

		form.update();
		form.clear();
		form.set(this.block.data);
		Object.values(this.helpers).forEach(function(inst) {
			if (inst.update) inst.update(this.block);
		}, this);
		Object.values(this.filters).forEach(function(inst) {
			if (inst.update) inst.update(this.block);
		}, this);
		if (selection && selection.name) {
			setTimeout(function() {
				// give an instant for input mutations to propagate
				var found = form.node.querySelector(`[name="${selection.name}"]`);
				if (found) {
					if (found.setSelectionRange && selection.start != null && selection.end != null) {
						found.setSelectionRange(selection.start, selection.end, selection.dir);
					}
					found.focus();
				}
			});
		}
	}
	this.ignoreEvents = false;
};

FormBlock.prototype.customHelper = function(key, prop, node) {
	if (prop.context && this.parents && !this.parents.some(function(parent) {
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

FormBlock.prototype.change = function(e) {
	if (!this.block || this.ignoreEvents || !this.form) return;
	if (e && e.target && e.target.name && e.target.name.startsWith('$')) return;
	var editor = this.editor;
	var data = this.form.get();

	var same = Pageboard.JSON.stableStringify(this.block.data) == Pageboard.JSON.stableStringify(data);
	if (same) return;

	var id = this.block.id;
	var found = false;

	// this must be done after reselecting with breadcrumb.click
	var block = Object.assign({}, this.block);
	block.data = JSON.parse(JSON.stringify(block.data));
	Object.assign(block.data, data);

	if (id == editor.state.doc.attrs.id) {
		found = true;
		editor.blocks.set(block);
		editor.controls.store.update();
		return;
	}

	var tr = editor.state.tr;
	var dispatch = false;

	if (this.el.inplace) {
		// simply select focused node
		var node = this.el.inline ? this.parents[0].inline.rpos : editor.root.querySelector('[block-focused="last"]');
		if (node) {
			editor.utils.refreshTr(tr, node, block);
			dispatch = true;
		}
	} else {
		var nodes = editor.blocks.domQuery(id, {all: true});

		if (nodes.length == 0) {
			if (!found) console.warn("No dom nodes found for this block", block);
		} else {
			nodes.forEach(function(node) {
				editor.utils.refreshTr(tr, node, block);
			});
			dispatch = true;
		}
	}
	if (dispatch) {
		editor.dispatch(tr);
	}
};

})(window.Pageboard, window.Pagecut);

