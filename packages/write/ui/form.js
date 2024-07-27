class FormBlock {
	static propToMeta(schema) {
		const copy = {};
		let hint = '';
		if (schema.discriminator) {
			Object.assign(copy, schema);
			delete copy.required;
		} else if (schema.properties) {
			copy.type = 'object';
			copy.properties = Object.assign({}, schema.properties);
		} else if (schema.type == "array") {
			if (!schema.items) {
				// this is probably an error, skip
				copy.type = 'string';
			} else if (Array.isArray(schema.items)) {
				copy.type = 'array';
				copy.items = schema.items;
			} else {
				copy.type = 'string';
			}
		} else if (schema.type || schema.anyOf || schema.oneOf) {
			if (schema.type) {
				hint = schema.type;
			} else if (schema.anyOf) {
				hint = 'any of: ' + schema.anyOf.map(item => item.const).join(', ');
			} else if (schema.oneOf) {
				hint = 'one of: ' + schema.oneOf.map(item => item.const).join(', ');
			}
			copy.type = 'string';
			copy.format = schema.type == "object" ? null : 'singleline';
			if (schema.pattern) hint = schema.pattern;
			else if (schema.format) hint = schema.format;
		} else {
			return Object.assign({}, schema);
		}
		if (schema.nullable) copy.nullable = schema.nullable;
		if (schema.default !== undefined) hint += ` (default: ${schema.default})`;
		copy.placeholder = hint;
		copy.title = schema.title;
		return copy;
	}
	static pruneObj(obj, schema) {
		let allNulls = true;
		const entries = Object.entries(obj).map(([key, val]) => {
			const prop = schema.properties?.[key];
			if (prop?.type == "object" && val != null) {
				val = this.pruneObj(val, prop);
				if (val == null) return null;
			}
			if (val === "" && prop?.nullable) val = null;
			if (val == null || typeof val == "number" && Number.isNaN(val)) {
				return prop?.nullable ? [key, null] : null;
			} else {
				return [key, val];
			}
		}).filter(entry => {
			if (entry != null && entry[1] != null) allNulls = false;
			return entry != null;
		});
		if (entries.length == 0 || allNulls) return null;
		if (Array.isArray(obj)) {
			return entries.map(([key, val]) => val);
		} else {
			const copy = {};
			for (const [key, val] of entries) {
				copy[key] = val;
			}
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
		el = this.el = { ...el };
		if (el.properties) {
			el.properties = structuredClone(el.properties);
		}

		this.helpers = {};
		this.filters = {};
	}

	destroy() {
		this.node.removeEventListener('change', this);
		this.node.removeEventListener('input', this);
		Object.values(this.helpers).forEach(inst => {
			if (inst.destroy) inst.destroy();
		});
		this.helpers = {};
		Object.values(this.filters).forEach(inst => {
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
			this.block = { ...block };
			this.block[mode] = structuredClone(block[mode]);
		}
		if (parents) {
			this.parents = parents;
		}

		if (!sameData || !sameMode) {
			const schema = { ...this.el, type: 'object' };
			if (this.el.contents.attrs.length) {
				const contentProps = {};
				schema.properties = {
					...schema.properties,
					$content: {
						title: 'Contents',
						type: 'object',
						properties: contentProps
					}
				};
				for (const spec of this.el.contents.attrs) {
					contentProps[spec.id] = { ...spec, nullable: true, type: 'string' };
				}
			}

			let form = this.form;
			if (!form) form = this.form = new Pageboard.Semafor({
				schema,
				node: this.node,
				filter: this.customFilter.bind(this),
				helper: this.customHelper.bind(this),
				schemas: Pageboard.schemas
			});

			if (!sameMode || Object.keys(this.filters).length > 0) {
				form.update(form.schema);
				form.clear();
			}
			let recheck = false;
			const obj = structuredClone(this.block[mode]);
			if (mode == "expr") {
				this.fillExpr(obj, form.schema.properties);
				form.set(obj);
				recheck = true;
			} else if (mode == "lock") {
				form.set({ lock: obj });
			} else if (mode == "data") {
				const data = { ...this.block.data };
				if (this.el.contents.attrs) {
					data.$content = {};
					for (const spec of this.el.contents.attrs) {
						data.$content[spec.id] = this.block.content[spec.id];
					}
				}
				form.set(data);
			} else {
				form.set(this.block[mode]);
			}

			for (const inst of Object.values(this.helpers)) {
				if (inst.update) inst.update(this.block);
			}
			this.node.addEventListener('change', this);
			this.node.addEventListener('input', this);
			this.ignoreEvents = false;
			if (recheck) this.handleEvent({});
		}
	}

	fillExpr(expr, props) {
		if (!props) return;
		for (const [key, schema] of Object.entries(props)) {
			if (schema.type != 'object') continue;
			const obj = expr[key] ??= {};
			if (schema.templates) {
				for (const [key, value] of Object.entries(schema.templates)) {
					if (obj[key] == null) {
						obj[key] = value;
					}
				}
			}
			if (schema.properties) this.fillExpr(obj, schema.properties);
		}
	}

	customHelper({ key, prop, node, parentProp }) {
		const editor = this.editor;
		if (prop.context && this.parents && !this.parents.some(parent => {
			return prop.context.split('|').some(tok => {
				const type = parent.block.type;
				if (type == tok) return true;
				const el = editor.element(type);
				return (el.group || "").split(' ').includes(tok);
			});
		})) {
			node.querySelector(`[name="${key}"]`)
				?.closest('.inline.field,.field')?.remove();
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
			console.warn("Unknown helper name", prop);
			return;
		}

		if (this.mode == "expr") {
			return;
		}
		let inst = this.helpers[key];
		inst?.destroy?.();
		inst = this.helpers[key] = new Helper(node.querySelector(`[name="${key}"]`), opts, prop, parentProp);
		inst.init?.(this.block, prop, this.form);
	}
	customFilter(key, prop, parentProp) {
		let opts = prop.$filter;
		if (!opts && prop.discriminator) {
			opts = {
				name: 'discriminator'
			};
		}
		if (this.mode == "lock") {
			if (key == null) return {
				type: 'object',
				properties: {
					lock: {
						title: 'Locks',
						$ref: "/elements#/definitions/settings/properties/data/properties/grants"
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
				console.warn("Unknown filter name", prop);
				return prop;
			}
			let inst = this.filters[key];
			if (!inst) {
				inst = this.filters[key] = new Filter(key, opts, prop, parentProp);
			}
			prop = inst.update?.(this.block, prop, this.form) || prop;
		}
		if (this.mode == "expr") {
			prop = FormBlock.propToMeta(prop);
		}
		return prop;
	}

	handleEvent(e) {
		if (!this.block || this.ignoreEvents || !this.form) return;
		if (e?.target) {
			if (!e.target.matches('.nullable') && !e.target.name || e.target.name.startsWith('!')) return;
			if (e.type == "input" && ["checkbox", "radio", "select"].includes(e.target.type)) return; // change events only
		}
		const editor = this.editor;
		let formData = FormBlock.pruneObj(this.form.get(), this.form.filteredSchema) ?? {};
		const mode = this.mode;
		if (mode == "lock") formData = formData.lock ?? [];

		let same = Pageboard.utils.stableStringify(this.block[mode]) == Pageboard.utils.stableStringify(formData);

		const { $content: content } = formData;
		delete formData.$content;
		if (content) {
			for (const key of Object.keys(content)) {
				if (content[key] != this.block.content[key]) same = false;
			}
		}
		if (same) return;

		const id = this.block.id;

		// this must be done after reselecting with breadcrumb.click
		const block = { ...this.block };
		if (content) block.content = { ...this.block.content, ...content };
		block[mode] = structuredClone(formData);

		const tr = editor.state.tr;
		let dispatch = false;

		if (this.el.inplace) {
			// simply select focused node
			const node = this.parents[0].inline && this.parents[0].inline.rpos || this.parents[0].rpos || editor.root.querySelector('[block-focused="last"]');
			if (node) {
				editor.utils.refreshTr(tr, node, block);
				dispatch = true;
			}
		} else {
			const nodes = editor.blocks.domQuery(id, {all: true});

			if (nodes.length == 0) {
				console.warn("No dom nodes found for this block", block);
			} else {
				for (const node of nodes) {
					editor.utils.refreshTr(tr, node, block);
				}
				dispatch = true;
			}
		}
		if (dispatch) {
			editor.dispatch(tr);
		} else {
			// No dom nodes found, but maybe that was some change
			editor.controls.store.update();
		}
	}

	reset() {
		this.form.clear();
	}
}

Pageboard.Controls.Form = class Form {
	constructor(editor, node) {
		this.editor = editor;

		this.node = node;
		this.inlines = [];

		this.mode = "data";

		this.toggleExpr = document.querySelector('#toggle-expr');
		this.toggleLocks = document.querySelector('#toggle-lock');
	}

	destroy() {
		if (this.main) {
			this.toggleExpr.removeEventListener('click', this);
			this.toggleLocks.removeEventListener('click', this);
			this.main.destroy();
			delete this.main;
		}
		for (const form of this.inlines) {
			form.destroy();
		}
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
		const showBlocks = sel.jsonID == "all" || sel.node?.isBlock || sel.node?.isLeaf;
		const showInlines = sel.jsonID != "all" && (!sel.node || sel.node?.isLeaf);

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
			if (this.block && (block.id != this.block.id || block.type != this.block.type)) {
				this.destroy();
			}
			this.block = block;
		}
		const editor = this.editor;

		const showExpressions = parents.find((item, i) => {
			const el = editor.element(item.block.type);
			if (!el) return false;
			if (el.expressions && !i) return true;
			const def = item.contentName && el.contents.find(item.contentName);
			return def?.expressions || false;
		});

		if (!this.main) {
			this.toggleExpr.addEventListener('click', this);
			this.toggleLocks.addEventListener('click', this);
			this.main = new FormBlock(editor, this.node, parent.type);
		}
		this.main.update(parents, block, this.mode);

		let canShowExpressions = this.main.el.properties;
		this.main.node.classList.toggle('hidden', !showBlocks);
		const allBlocks = [this.block];

		const curInlines = this.inlines;
		const inlines = (showInlines && parent.inline?.blocks || []).map(block => {
			let curForm;
			// curInlines is filtered several times
			// but it needs to keep the forms that are not used
			for (let i = 0; i < curInlines.length; i++) {
				const form = curInlines[i];
				if (form.block.type == block.type) {
					curForm = form;
					curInlines.splice(i, 1);
					break;
				}
			}
			allBlocks.push(block);
			if (!curForm) {
				curForm = new FormBlock(editor, this.node, block.type);
			} else {
				curForm.node.parentNode.appendChild(curForm.node);
				curForm.reset();
			}
			curForm.update(parents, block, this.mode);
			canShowExpressions ||= curForm.el.properties;
			return curForm;
		});
		this.toggleExpr.classList.toggle('hidden', !showExpressions);
		this.toggleExpr.classList.toggle('disabled', !canShowExpressions);
		this.toggleExpr.classList.toggle('active', this.mode == "expr");
		this.toggleExpr.firstElementChild.classList.toggle('yellow',
			allBlocks.some(b => b.expr && Object.keys(b.expr).length)
		);

		const unlocked = !allBlocks.some(
			b => b.lock?.length
		);
		this.toggleLocks.firstElementChild.classList.toggle('lock', !unlocked);
		this.toggleLocks.firstElementChild.classList.toggle('red', !unlocked);
		this.toggleLocks.firstElementChild.classList.toggle('unlock', unlocked);
		this.toggleLocks.classList.toggle('active', this.mode == "lock");

		for (const form of curInlines) {
			form.destroy();
		}
		this.inlines = inlines;

		if (selection?.name) {
			const found = this.node.querySelector(`[name="${selection.name}"]`);
			if (!found) return;
			if (found.setSelectionRange && selection.start != null && selection.end != null) {
				found.setSelectionRange(selection.start, selection.end, selection.dir);
			}
			found.focus();
		}
	}

	handleEvent(e) {
		if (e.type == "click") {
			if (this.toggleLocks.contains(e.target)) {
				this.mode = this.mode == "lock" ? "data" : "lock";
				this.toggleLocks.classList.toggle('active', this.mode == "lock");
			} else if (this.toggleExpr.contains(e.target)) {
				this.mode = this.mode == "expr" ? "data" : "expr";
				this.toggleExpr.classList.toggle('active', this.mode == "expr");
			} else return;
			this.update(this.parents, this.selection);
		}
	}
};

