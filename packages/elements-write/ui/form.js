(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;

function Form(editor, node) {
	this.editor = editor;

	this.node = node;
	this.inlines = [];

	this.mode = "data";

	this.toggleExpr = document.querySelector('#toggle-expr');
	this.toggleExpr.addEventListener('click', this.handleToggleExpr.bind(this));

	this.toggleLocks = document.querySelector('#toggle-lock');
	this.toggleLocks.addEventListener('click', this.handleToggleLocks.bind(this));
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
	this.selection = sel;
	var parent = parents[0];
	this.parents = parents;
	var showBlocks = sel.jsonID == "all" || sel.node && (sel.node.isBlock || sel.node.isLeaf);
	var showInlines = sel.jsonID != "all" && (!sel.node || sel.node && sel.node.isLeaf);

	var block = parent.block;
	if (!block) {
		this.destroy();
		return;
	}

	if (block != this.block) {
		this.mode = "data";
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
		var def = item.contentName && el.contents.find(item.contentName);
		return def && def.expressions || false;
	});

	if (!this.main) this.main = new FormBlock(editor, this.node, block.type);
	this.main.update(parents, block, this.mode);

	var canShowExpressions = this.main.el.properties;
	this.main.node.classList.toggle('hidden', !showBlocks);

	var curInlines = this.inlines;
	var inlines = (showInlines && parent.inline && parent.inline.blocks || []).map(function(block) {
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
	this.toggleExpr.classList.toggle('hidden', !showExpressions);
	this.toggleExpr.classList.toggle('disabled', !canShowExpressions);
	this.toggleExpr.classList.toggle('active', this.mode == "expr");
	this.toggleExpr.firstElementChild.classList.toggle('yellow', this.block.expr && Object.keys(this.block.expr).length && true || false);

	var lock = this.block.lock;
	var unlocked = true;
	if (lock) {
		if (lock.read && lock.read.length) unlocked = false;
		else if (lock.write && lock.write.length) unlocked = false;
	}
	this.toggleLocks.firstElementChild.classList.toggle('lock', !unlocked);
	this.toggleLocks.firstElementChild.classList.toggle('red', !unlocked);
	this.toggleLocks.firstElementChild.classList.toggle('unlock', unlocked);
	this.toggleLocks.classList.toggle('active', this.mode == "lock");

	curInlines.forEach(function(form) {
		form.destroy();
	});
	this.inlines = inlines;
};

Form.prototype.handleToggleLocks = function(e) {
	this.mode = this.mode == "lock" ? "data" : "lock";
	this.toggleLocks.classList.toggle('active', this.mode == "lock");
	this.update(this.parents, this.selection);
};

Form.prototype.handleToggleExpr = function(e) {
	this.mode = this.mode == "expr" ? "data" : "expr";
	this.toggleExpr.classList.toggle('active', this.mode == "expr");
	this.update(this.parents, this.selection);
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
	this.node.addEventListener('change', this);

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
	this.node.remove();
	this.node.removeEventListener('change', this);
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

		if (!sameMode || Object.keys(this.filters).length > 0) {
			form.update(form.schema);
			form.clear();
		}
		form.set(this.block[mode]);
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
	var editor = this.editor;
	if (prop.context && this.parents && !this.parents.some(function(parent) {
		return prop.context.split('|').some(function(tok) {
			var type = parent.block.type;
			if (type == tok) return true;
			var el = editor.element(type);
			return (el.group || "").split(' ').includes(tok);
		});
	})) {
		var input = node.querySelector(`[name="${key}"]`);
		if (input) {
			var field = input.closest('.inline.fields') || input.closest('.field');
			if (field) field.remove();
		}
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
	if (inst.init) prop = inst.init(this.block, prop);
};

function schemaToMeta(schema) {
	var copy = propToMeta(schema);
	if (schema.properties) {
		Object.entries(schema.properties).forEach(function([key, prop]) {
			copy.properties[key] = schemaToMeta(prop);
		});
	}
	return copy;
}

function propToMeta(schema) {
	var copy = {};
	if (schema.properties || schema.type == "object") {
		copy.type = 'object';
		if (schema.properties) copy.properties = schema.properties;
		else copy.description = 'object';
	} else if (schema.type || schema.anyOf || schema.oneOf) {
		var hint = '';
		if (schema.type) {
			hint = schema.type;
		} else if (schema.anyOf) {
			hint = 'any of: ' + schema.anyOf.map(function(item) {
				return item.const;
			}).join(', ');
		} else if (schema.oneOf) {
			hint = 'one of: ' + schema.anyOf.map(function(item) {
				return item.const;
			}).join(', ');
		}
		copy.type = 'string';
		copy.format = 'singleline';
		if (schema.pattern) hint = schema.pattern;
		else if (schema.format) hint = schema.format;
		if (schema.default) hint += ` (default: ${schema.default})`;
		copy.default = hint;
	} else {
		return schema;
	}
	copy.title = schema.title;
	return copy;
}

FormBlock.prototype.customFilter = function(key, prop) {
	var opts = prop.$filter;
	if (this.mode == "lock") {
		if (key == null) return {
			title: 'Locks',
			type: 'object',
			properties: {
				read: {
					title: 'Read',
					type: 'array',
					items: this.editor.element('settings').properties.grants.items
				},
				write: {
					title: 'Write',
					type: 'array',
					items: this.editor.element('settings').properties.grants.items
				}
			}
		};
		else return;
	}
	if (opts) {
		if (typeof opts == "string") {
			opts = {name: opts};
		} else if (!opts.name) {
			console.warn("$filter without name", prop);
			return prop;
		}
		var Filter = Pageboard.schemaFilters[opts.name];
		if (!Filter) {
			console.error("Unknown filter name", prop);
			return prop;
		}
		var inst = this.filters[key];
		if (!inst) {
			inst = this.filters[key] = new Filter(key, opts, prop);
		}
		prop = inst.update && inst.update(this.block, prop) || prop;
	}
	if (this.mode == "expr") {
		prop = propToMeta(prop);
	}
	return prop;
};

FormBlock.prototype.handleEvent = function(e) {
	if (!this.block || this.ignoreEvents || !this.form) return;
	if (e && e.target && (!e.target.name || e.target.name.startsWith('$'))) return;
	var editor = this.editor;
	var formData = pruneObj(this.form.get()) || {};
	var mode = this.mode;

	var same = Pageboard.JSON.stableStringify(this.block[mode]) == Pageboard.JSON.stableStringify(formData);
	if (same) return;

	var id = this.block.id;
	var found = false;

	// this must be done after reselecting with breadcrumb.click
	var block = Object.assign({}, this.block);
	block[mode] = formData;

	if (id == editor.state.doc.attrs.id) {
		var stored = editor.blocks.get(block.id);
		if (stored) Object.assign(stored, block);
		else editor.blocks.set(block);
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
	var entries = Object.entries(obj).map(function([key, val]) {
		if (val == null || val === "" || typeof val == "number" && isNaN(val)) {
			return null;
		} else if (typeof val == "object") {
			val = pruneObj(val);
			if (val == null) return null;
		}
		return [key, val];
	}).filter(function(entry) {
		return entry != null;
	});
	if (entries.length == 0) return null;
	if (Array.isArray(obj)) {
		return entries.map(function([key, val]) {
			return val;
		});
	} else {
		var copy = {};
		entries.forEach(function([key, val]) {
			copy[key] = val;
		});
		return copy;
	}
}

})(window.Pageboard, window.Pagecut);

