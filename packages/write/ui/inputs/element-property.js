Pageboard.schemaHelpers['element-property'] = class ElementProperty {
	constructor(input, opts, props) {
		this.field = input.closest('.field');
		this.field.classList.add('inline');
		this.input = input;
		this.existing = opts.existing;
	}

	static asPaths(obj, ret, pre) {
		if (!ret) ret = {};
		const discName = this.discriminator(obj);
		if (discName) {
			const discSchema = obj.properties[discName];
			if (obj.selectCases) {
				for (const [discValue, subSchema] of Object.entries(obj.selectCases)) {
					const discCase = (discSchema.oneOf || discSchema.anyOf).find((it) => {
						return it.const == discValue;
					});
					const subRet = {};
					ElementProperty.asPaths(subSchema, subRet, `${pre || ''}${discName}.${discValue}.`);
					for (const prop of Object.values(subRet)) {
						prop.title = `${discCase.title}: ${prop.title}`;
					}
					Object.assign(ret, subRet);
				}
			} else if (obj.oneOf || obj.anyOf) {
				// TODO finish this
				for (const schema of (obj.oneOf || obj.anyOf)) {
					ElementProperty.asPaths(schema, ret, schema.properties[obj.discriminator.propertyName] + '.');
				}
			}
		}
		if (obj.properties) {
			const props = obj.properties;
			if (Object.keys(props).sort().join(' ') == "end start") {
				ret[pre.slice(0, -1)] = obj;
			}
			for (const [key, val] of Object.entries(props)) {
				const cur = `${pre || ""}${key}`;
				ret[cur] = Object.assign({}, val);
				ElementProperty.asPaths(val, ret, cur + '.');
			}
		} else if (obj.type == "array" && obj.items && !Array.isArray(obj.items)) {
			return this.asPaths(obj.items, ret, pre);
		}

		return ret;
	}

	static discriminator(schema) {
		if (schema.select) {
			const ref = schema.select.$data;
			if (!ref || !ref.startsWith('0/')) return null;
			return ref.substring(2);
		} else if (schema.discriminator) {
			return schema.discriminator.propertyName;
		}
	}

	init(block) {
		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error("Cannot create input, DOM node not found for block " + block.id);
		const form = dom.closest('form');
		const formId = form.getAttribute('block-id');
		const formBlock = Pageboard.editor.blocks.get(formId);
		if (!formBlock) throw new Error("Cannot find form block for " + formId);
		this.formBlock = formBlock;
		let type = formBlock.data ?? {};
		if (formBlock.type == "query_form") {
			type = type.type;
		} else if (formBlock.type == "api_form") {
			type = type.action?.parameters?.type;
		} else {
			type = null;
		}
		if (!type) throw new Error("Please select a type to bind the form to");
		const el = Pageboard.editor.element(type);
		if (!el) throw new Error("Cannot map type to element " + type);
		this.el = el;

		this.input.hidden = true;
		const doc = this.input.ownerDocument;
		const paths = ElementProperty.asPaths(this.el, {}, this.el.name + '.');
		const content = Pageboard.editor.element(form.getAttribute('block-type')).contents.get(this.formBlock);
		const existing = this.existing;
		this.select = doc.dom(`<select class="ui compact dropdown">
			<option value="">--</option>
		</select>`);
		const context = {
			level: 0,
			key: null,
			parent: this.select
		};
		const dateFormats = ["date", "time", "date-time"];
		for (const [key, prop] of Object.entries(paths)) {
			const parts = key.split('.');
			const pkey = parts.slice(0, -1).join('.');
			if (context.key && context.key != pkey) {
				context.level--;
				context.key = pkey;
				context.parent = context.parent.parentNode || context.parent;
			}
			if (!prop.title) continue;
			if (prop.type == "object" && !(Object.keys(prop.properties).sort().join(' ') == "end start" && dateFormats.includes(prop.properties.start.format) && dateFormats.includes(prop.properties.end.format))) {
				context.parent = context.parent.appendChild(
					doc.dom(`<optgroup label="${prop.title}"></optgroup>`)
				);
				context.level++;
				context.key = key;
			} else if (prop.type == "array" && prop.items?.properties) {
				// TODO <option value="${key}">@${prop.title}</option>
				// when form-input-property will be an helper instead of a block type
				context.parent = context.parent.appendChild(
					doc.dom(`<optgroup label="${prop.title}"></optgroup>`)
				);
				context.level++;
				context.key = key;
			} else {
				const node = doc.dom(`<option value="${key}">${prop.title}</option>`);
				const disable = Boolean(
					content.querySelector(`[name="${parts.slice(1).join('.')}"]`)
				);
				if (existing) node.disabled = !disable;
				else node.disabled = disable;
				context.parent.appendChild(node);
			}
		}
		this.field.appendChild(this.select);
		this.select.addEventListener('change', this.toInput.bind(this));
		this.update(block);
	}

	toInput() {
		const cur = this.select.value;
		this.updateOptions(this.input.value, cur);
		this.input.value = cur;
		// not sure it's useful to trigger something here
		Pageboard.trigger(this.input, 'change');
	}

	updateOptions(prev, cur) {
		for (const opt of this.select.options) {
			if (opt.value == prev) opt.disabled = false;
			if (opt.value == cur) opt.disabled = true;
		}
	}

	update(block) {
		const cur = block.data.name || "";
		this.updateOptions(this.select.value, cur);
		this.select.value = cur;
	}

	destroy() {
		if (this.select) this.select.remove();
		this.input.hidden = false;
	}

};

Pageboard.schemaFilters['element-value'] = class ElementValueFilter {
	constructor(key, opts) {
		this.key = key;
		this.using = opts.using;
	}

	update(block, schema) {
		const empty = { title: schema.title, $filter: schema.$filter, type: "null" };
		const usingPath = this.using.split('.');
		const key = usingPath.reduce((obj, name) => obj?.[name], block.data);
		if (!key) return empty;
		const path = key.split('.');
		const type = path.shift();
		const el = Pageboard.editor.elements[type];
		if (!el) return empty;
		const prop = path.reduce((obj, name) => {
			return obj?.properties?.[name];
		}, el);
		if (!prop) return empty;
		delete empty.type;
		return Object.assign({}, prop, empty);
	}
};
