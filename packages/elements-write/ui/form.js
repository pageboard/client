(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;

function Form(editor, node) {
	this.editor = editor;
	this.node = node;
	this.inlines = [];
	this.mode = "data";
	this.switcher = this.node.dom(`<div class="ui floating right mini circular label button">$</div>`);
	this.switcher.addEventListener('click', this.handleSwitch.bind(this));
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
	if (this.switcher) this.switcher.remove();
};

Form.prototype.update = function(parents) {
	if (this.ignoreNext) {
		this.ignoreNext = false;
		return;
	}
	if (!parents.length) {
		this.destroy();
		return;
	}
	var parent = parents[0];
	this.parents = parents;

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
	var editor = this.editor;

	var showExpressions = parents.find(function(item, i) {
		var el = editor.element(item.block.type);
		if (!el) return false;
		if (el.expressions && !i) return true;
		var spec = item.contentName && el.contents && el.contents[item.contentName];
		return spec && spec.expressions || false;
	});

	if (!this.main) this.main = new FormBlock(editor, this.node, block.type);

	this.main.update(parents, block, this.mode);

	var canShowExpressions = this.main.el.properties;

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
			curForm = new FormBlock(editor, this.node, block.type);
		} else {
			curForm.node.parentNode.appendChild(curForm.node);
		}
		curForm.update(parents, block, this.mode);
		canShowExpressions = canShowExpressions || curForm.el.properties;
		return curForm;
	}, this);

	if (canShowExpressions && showExpressions) {
		if (!this.switcher.parentNode) this.node.appendChild(this.switcher);
	} else {
		this.switcher.remove();
	}

	curInlines.forEach(function(form) {
		form.destroy();
	});
	this.inlines = inlines;
};

Form.prototype.handleSwitch = function(e) {
	this.mode = this.mode == "expr" ? "data" : "expr";
	this.switcher.classList.toggle('active', this.mode == "expr");
	this.update(this.parents);
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

FormBlock.prototype.update = function(parents, block, mode) {
	this.ignoreEvents = true;
	var sameData = false;
	var sameMode = mode == this.mode;
	this.mode = mode;
	if (block) {
		if (this.block) {
			if (!sameMode) {
				sameData = Pageboard.JSON.stableStringify(this.block[mode]) == Pageboard.JSON.stableStringify(block[mode]);
			}
		}
		this.block = Object.assign({}, block);
		this.block[mode] = JSON.parse(JSON.stringify(block[mode] || {}));
	}
	if (parents) {
		this.parents = parents;
	}

	if (!sameData || !sameMode) {
		var schema = Object.assign({}, this.el, {type: 'object'});
		var active = document.activeElement;
		var selection = active ? {
			name: active.name,
			start: active.selectionStart,
			end: active.selectionEnd,
			dir: active.selectionDirection
		} : null;

		var form = this.form;
		if (!form) form = this.form = new window.Semafor(
			schema,
			this.node,
			this.customFilter.bind(this),
			this.customHelper.bind(this)
		);

		if (!form.lastSchema || !sameMode || Object.keys(this.filters).length > 0) {
			form.update(mode == "expr" ? form.lastSchema : form.schema);
			form.clear();
		}
		form.set(this.block[mode]);
		Object.values(this.filters).forEach(function(inst) {
			if (inst.update) inst.update(this.block);
		}, this);
		Object.values(this.helpers).forEach(function(inst) {
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

	if (this.mode == "expr") {
		return;
	}
	var inst = this.helpers[key];
	if (inst && inst.destroy) inst.destroy();
	inst = this.helpers[key] = new Helper(node.querySelector(`[name="${key}"]`), opts, prop);
	if (inst.init) inst.init(this.block);
};

FormBlock.prototype.customFilter = function(key, prop) {
	var opts = prop.$filter;
	if (this.mode == "expr") {
		if (!prop.properties && prop.type != "object" && (prop.type || prop.anyOf || prop.oneOf)) {
			Object.keys(prop).forEach(function(key) {
				if (['title', 'type', 'format'].includes(key) == false && !key.startsWith('$')) delete prop[key];
			});
			prop.type = 'string';
			prop.format = 'singleline';
		} else {
			return;
		}
	}
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
	var inst = this.filters[key];
	if (!inst || !inst.update) {
		inst = this.filters[key] = new Filter(key, opts, prop);
		if (inst.init) inst.init(this.block);
	} else {
		inst.update(this.block);
	}
};

FormBlock.prototype.change = function(e) {
	if (!this.block || this.ignoreEvents || !this.form) return;
	if (e && e.target && (!e.target.name || e.target.name.startsWith('$'))) return;
	var editor = this.editor;
	var formData = pruneObj(this.form.get());
	var mode = this.mode;

	var same = Pageboard.JSON.stableStringify(this.block[mode]) == Pageboard.JSON.stableStringify(formData);
	if (same) return;

	var id = this.block.id;
	var found = false;

	// this must be done after reselecting with breadcrumb.click
	var block = Object.assign({}, this.block);
	block[mode] = formData;

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

function pruneObj(obj) {
	var copy = Object.assign({}, obj);
	Object.keys(copy).forEach(function(key) {
		var val = copy[key];
		if (val == null || val === "" || typeof val == "number" && isNaN(val)) {
			delete copy[key];
		} else if (typeof val == "object") {
			val = pruneObj(val);
			if (Object.keys(val).length == 0) delete copy[key];
			else copy[key] = val;
		}
	});
	return copy;
}

})(window.Pageboard, window.Pagecut);

