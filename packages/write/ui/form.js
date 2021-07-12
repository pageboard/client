Pageboard.Controls.Form = class Form {
	constructor(editor, node) {
		this.editor = editor;

		this.node = node;
		this.inlines = [];

		this.mode = "data";

		this.toggleExpr = document.querySelector('#toggle-expr');
		this.toggleExpr.addEventListener('click', this.handleToggleExpr.bind(this));

		this.toggleLocks = document.querySelector('#toggle-lock');
		this.toggleLocks.addEventListener('click', this.handleToggleLocks.bind(this));
	}

	destroy() {
		if (this.main) {
			this.main.destroy();
			delete this.main;
		}
		this.inlines.forEach(function (form) {
			form.destroy();
		});
		this.inlines = [];
		this.mode = "data";
	}

	update(parents, sel) {
		if (this.ignoreNext) {
			this.ignoreNext = false;
			return;
		}
		if (!parents.length) {
			this.destroy();
			return;
		}
		this.selection = sel;
		const parent = parents[0];
		this.parents = parents;
		const showBlocks = sel.jsonID == "all" || sel.node && (sel.node.isBlock || sel.node.isLeaf);
		const showInlines = sel.jsonID != "all" && (!sel.node || sel.node && sel.node.isLeaf);

		const block = parent.block;
		if (!block) {
			this.destroy();
			return;
		}

		const active = document.activeElement;
		const selection = active ? {
			name: active.name,
			start: active.selectionStart,
			end: active.selectionEnd,
			dir: active.selectionDirection
		} : null;

		if (block != this.block) {
			this.destroy();
			this.block = block;
		}
		const editor = this.editor;

		const showExpressions = parents.find(function (item, i) {
			const el = editor.element(item.block.type);
			if (!el) return false;
			if (el.expressions && !i) return true;
			const def = item.contentName && el.contents.find(item.contentName);
			return def && def.expressions || false;
		});

		if (!this.main) this.main = new FormBlock(editor, this.node, parent.type);
		this.main.update(parents, block, this.mode);

		let canShowExpressions = this.main.el.properties;
		this.main.node.classList.toggle('hidden', !showBlocks);

		let curInlines = this.inlines;
		const inlines = (showInlines && parent.inline && parent.inline.blocks || []).map(function (block) {
			let curForm;
			curInlines = curInlines.filter(function (form) {
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
				curForm.reset();
			}
			curForm.update(parents, block, this.mode);
			canShowExpressions = canShowExpressions || curForm.el.properties;
			return curForm;
		}, this);
		this.toggleExpr.classList.toggle('hidden', !showExpressions);
		this.toggleExpr.classList.toggle('disabled', !canShowExpressions);
		this.toggleExpr.classList.toggle('active', this.mode == "expr");
		this.toggleExpr.firstElementChild.classList.toggle('yellow', this.block.expr && Object.keys(this.block.expr).length && true || false);

		const lock = this.block.lock;
		let unlocked = true;
		if (lock) {
			if (lock.read && lock.read.length) unlocked = false;
			else if (lock.write && lock.write.length) unlocked = false;
		}
		this.toggleLocks.firstElementChild.classList.toggle('lock', !unlocked);
		this.toggleLocks.firstElementChild.classList.toggle('red', !unlocked);
		this.toggleLocks.firstElementChild.classList.toggle('unlock', unlocked);
		this.toggleLocks.classList.toggle('active', this.mode == "lock");

		curInlines.forEach(function (form) {
			form.destroy();
		});
		this.inlines = inlines;

		if (selection && selection.name) {
			setTimeout(() => {
				// give an instant for input mutations to propagate
				const found = this.node.querySelector(`[name="${selection.name}"]`);
				if (found && found != document.activeElement) {
					if (found.setSelectionRange && selection.start != null && selection.end != null) {
						found.setSelectionRange(selection.start, selection.end, selection.dir);
					}
					found.focus();
				}
			});
		}
	}

	handleToggleLocks(e) {
		this.mode = this.mode == "lock" ? "data" : "lock";
		this.toggleLocks.classList.toggle('active', this.mode == "lock");
		this.update(this.parents, this.selection);
	}

	handleToggleExpr(e) {
		this.mode = this.mode == "expr" ? "data" : "expr";
		this.toggleExpr.classList.toggle('active', this.mode == "expr");
		this.update(this.parents, this.selection);
	}
};

class FormBlock {
	static propToMeta(schema) {
		const copy = {};
		let hint = '';
		if (schema.properties || schema.type == "object") {
			copy.type = 'object';
			if (schema.nullable) copy.nullable = schema.nullable;
			if (schema.properties) copy.properties = schema.properties;
			else copy.description = 'object';
		} else if (schema.type == "array") {
			copy.type = 'array';
			copy.items = { type: 'string' };
		} else if (schema.type || schema.anyOf || schema.oneOf) {
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
		} else {
			return schema;
		}

		if (schema.default !== undefined) hint += ` (default: ${schema.default})`;
		copy.placeholder = hint;
		copy.title = schema.title;
		return copy;
	}
	static pruneObj(obj, schema) {
		const entries = Object.entries(obj).map(([key, val]) => {
			const prop = schema.properties && schema.properties[key] || null;
			if (prop && prop.type == "object") {
				if (val != null) val = this.pruneObj(val, prop);
				return [key, val];
			} else if (val == null || val === "" || typeof val == "number" && Number.isNaN(val)) {
				return null;
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
			const copy = {};
			entries.forEach(function([key, val]) {
				copy[key] = val;
			});
			return copy;
		}
	}
	constructor(editor, node, type) {
		this.node = node.appendChild(document.createElement('form'));
		this.node.setAttribute('autocomplete', 'off');
		this.editor = editor;
		let el = editor.element(type);
		if (!el) {
			throw new Error(`Unknown element type ${type}`);
		}
		el = this.el = Object.assign({}, el);
		if (el.properties) {
			el.properties = JSON.parse(JSON.stringify(el.properties));
		}

		this.helpers = {};
		this.filters = {};
	}

	destroy() {
		this.node.removeEventListener('change', this);
		this.node.removeEventListener('input', this);
		Object.values(this.helpers).forEach(function (inst) {
			if (inst.destroy) inst.destroy();
		});
		this.helpers = {};
		Object.values(this.filters).forEach(function (inst) {
			if (inst.destroy) inst.destroy();
		});
		this.filters = {};

		this.form.destroy();
		this.node.remove();
	}

	update(parents, block, mode) {
		this.ignoreEvents = true;
		let sameData = false;
		const sameMode = mode == this.mode;
		this.mode = mode;
		this.node.removeEventListener('change', this);
		this.node.removeEventListener('input', this);
		if (block) {
			if (this.block) {
				if (!sameMode) {
					sameData = Pageboard.utils.stableStringify(this.block[mode]) == Pageboard.utils.stableStringify(block[mode]);
				}
			}
			this.block = Object.assign({}, block);
			this.block[mode] = JSON.parse(JSON.stringify(block[mode] || {}));
		}
		if (parents) {
			this.parents = parents;
		}

		if (!sameData || !sameMode) {
			const schema = Object.assign({}, this.el, { type: 'object' });

			let form = this.form;
			if (!form) form = this.form = new Pageboard.Semafor(
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
			Object.values(this.helpers).forEach(function (inst) {
				if (inst.update) inst.update(this.block);
			}, this);
		}
		this.node.addEventListener('change', this);
		this.node.addEventListener('input', this);
		this.ignoreEvents = false;
	}

	customHelper(key, prop, node, parentProp) {
		const editor = this.editor;
		if (prop.context && this.parents && !this.parents.some(function (parent) {
			return prop.context.split('|').some(function (tok) {
				const type = parent.block.type;
				if (type == tok) return true;
				const el = editor.element(type);
				return (el.group || "").split(' ').includes(tok);
			});
		})) {
			const input = node.querySelector(`[name="${key}"]`);
			if (input) {
				const field = input.closest('.inline.fields') || input.closest('.field');
				if (field) field.remove();
			}
			return;
		}
		let opts = prop.$helper;
		if (!opts) return;
		if (typeof opts == "string") {
			opts = { name: opts };
		} else if (!opts.name) {
			console.warn("$helper without name", prop);
			return;
		}
		const Helper = Pageboard.schemaHelpers[opts.name];
		if (!Helper) {
			console.error("Unknown helper name", prop);
			return;
		}

		if (this.mode == "expr") {
			return;
		}
		let inst = this.helpers[key];
		if (inst && inst.destroy) inst.destroy();
		inst = this.helpers[key] = new Helper(node.querySelector(`[name="${key}"]`), opts, prop, parentProp);
		if (inst.init) prop = inst.init(this.block, prop);
	}
	customFilter(key, prop) {
		let opts = prop.$filter;
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
			const Filter = Pageboard.schemaFilters[opts.name];
			if (!Filter) {
				console.error("Unknown filter name", prop);
				return prop;
			}
			let inst = this.filters[key];
			if (!inst) {
				inst = this.filters[key] = new Filter(key, opts, prop);
			}
			prop = inst.update && inst.update(this.block, prop) || prop;
		}
		if (this.mode == "expr") {
			prop = FormBlock.propToMeta(prop);
		}
		return prop;
	}

	handleEvent(e) {
		if (!this.block || this.ignoreEvents || !this.form) return;
		if (e && e.target) {
			if (!e.target.matches('.nullable') && !e.target.name || e.target.name.startsWith('$')) return;
			if (e.type == "input" && ["checkbox", "radio", "select"].includes(e.target.type)) return; // change events only
		}
		const editor = this.editor;
		const formData = FormBlock.pruneObj(this.form.get(), this.form.schema) || {};
		const mode = this.mode;

		const same = Pageboard.utils.stableStringify(this.block[mode]) == Pageboard.utils.stableStringify(formData);
		if (same) return;

		const id = this.block.id;
		let found = false;

		// this must be done after reselecting with breadcrumb.click
		const block = Object.assign({}, this.block);
		block[mode] = formData;

		if (id == editor.state.doc.attrs.id) {
			const stored = editor.blocks.get(block.id);
			if (stored) Object.assign(stored, block);
			else editor.blocks.set(block);
			found = true;
		}

		const tr = editor.state.tr;
		let dispatch = false;

		if (this.el.inplace) {
			// simply select focused node
			const node = this.el.inline ? this.parents[0].inline.rpos : editor.root.querySelector('[block-focused="last"]');
			if (node) {
				editor.utils.refreshTr(tr, node, block);
				dispatch = true;
			}
		} else {
			const nodes = editor.blocks.domQuery(id, {all: true});

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
		} else {
			editor.controls.store.update();
		}
	}

	reset() {
		this.form.clear();
	}
}
