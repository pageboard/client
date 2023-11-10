class ElementProperty {
	#field;
	#input;
	#select;
	#prefix;

	constructor(input, opts, props) {
		this.#field = input.closest('.field');
		this.#field.classList.add('inline', 'datalist');
		this.#input = input;
	}

	static asPaths(obj, ret, prefix = []) {
		if (!ret) ret = {};
		const [discKey, discList] = this.discriminator(obj) ?? [];
		if (discKey) {
			const discProp = obj.properties?.[discKey];
			for (const [discValue, subSchema] of discList) {
				const discCase = (discProp?.oneOf ?? discProp?.anyOf ?? []).find(it => {
					return it.const == discValue;
				});
				const subRet = {};
				ElementProperty.asPaths(subSchema, subRet, prefix.concat([discKey, discValue]));
				if (discCase) for (const subProp of Object.values(subRet)) {
					subProp.title = `${discCase.title}: ${subProp.title}`;
				}
				Object.assign(ret, subRet);
			}
		}
		if (obj.properties) {
			const props = obj.properties;
			if (Object.keys(props).sort().join(' ') == "end start") {
				ret[prefix.join(".")] = obj;
			}
			for (const [key, val] of Object.entries(props)) {
				const cur = prefix.concat([key]);
				ret[cur.join('.')] = { ...val };
				ElementProperty.asPaths(val, ret, cur);
			}
		} else if (obj.type == "array" && obj.items && !Array.isArray(obj.items)) {
			return this.asPaths(obj.items, ret, prefix);
		}

		return ret;
	}

	static discriminator(schema) {
		if (schema.select) {
			const ref = schema.select.$data;
			if (!ref || !ref.startsWith('0/')) return null;
			return [
				ref.substring(2),
				Object.entries(schema.selectCases)
			];
		} else if (schema.discriminator) {
			const key = schema.discriminator.propertyName;
			if (!key) return null;
			return [
				key,
				schema.oneOf.map(obj => [obj.properties?.[key]?.const, obj])
			];
		}
	}

	init(block) {
		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error(
			`Cannot create input, DOM node not found for block ${block.id}`
		);
		this.dom = dom;
		this.#prefix = dom.closest('[block-type="fieldset_list"]')?.prefix ?? [];
		const form = dom.closest('form');
		const formId = form.getAttribute('block-id');
		const formBlock = Pageboard.editor.blocks.get(formId);
		if (!formBlock) throw new Error("Cannot find form block for " + formId);
		this.#buildSelector(formBlock);
	}

	static buildSchema(block) {
		let cand = null;
		if (block.type == "query_form") {
			cand = block.data?.type;
		} else if (block.type == "api_form") {
			cand = block.data?.action?.parameters?.type;
		}
		if (!cand) {
			return;
		}

		let el;

		if (Array.isArray(cand)) {
			const list = cand.map(type => {
				const el = Pageboard.editor.element(type);
				if (!el) throw new Error(
					`Unknown type in parent form ${block.type}: ${type}`
				);
				return {
					const: type,
					title: el.title
				};
			});
			el = {
				type: 'object',
				properties: {
					type: {
						title: 'Type',
						anyOf: list
					}
				}
			};
		} else {
			el = Pageboard.editor.element(cand);
		}
		if (!el) throw new Error(
			`Unknown type in parent form ${block.type}: ${cand}`
		);
		return el;
	}

	pathsProperties(block) {
		try {
			const el = ElementProperty.buildSchema(block);
			if (!el) return null;
			return ElementProperty.asPaths(el, {}, this.#prefix);
		} catch(err) {
			console.error(err);
		}
		return null;
	}

	#buildSelector(formBlock) {
		const content = Pageboard.editor.element(formBlock.type)
			.contents.get(formBlock);
		const paths = this.pathsProperties(formBlock, content);
		if (!paths) return;
		const doc = this.#input.ownerDocument;

		this.#select = doc.dom(`<select></select>`);
		const context = {
			level: 0,
			key: null,
			parent: this.#select
		};

		context.parent.appendChild(doc.dom(`<option hidden value=""></option>`));

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
			if (prop.type == "object" && prop.properties && !(Object.keys(prop.properties).sort().join(' ') == "end start" && dateFormats.includes(prop.properties.start.format) && dateFormats.includes(prop.properties.end.format))) {
				context.parent = context.parent.appendChild(
					doc.dom(`<optgroup label="${prop.title}"></optgroup>`)
				);
				context.level++;
				context.key = key;
			} else if (prop.type == "array" && prop.items?.properties) {
				context.parent = context.parent.appendChild(
					doc.dom(`<optgroup label="${prop.title}"></optgroup>`)
				);
				context.level++;
				context.key = key;
			} else {
				const name = key;
				const node = doc.dom(`<option value="${name}">${prop.title}</option>`);
				context.parent.appendChild(node);
				if (!this.existing) node.disabled = Boolean(
					content.querySelector(`[name="${name}"]`)
				);
			}
		}
		if (Object.keys(paths).length == 0) {
			context.parent.appendChild(doc.dom(`<option disabled>No inputs</option>`));
		}
		this.#field.insertBefore(this.#select, this.#input.nextSibling);
		this.#select.addEventListener('change', this);
	}

	handleEvent(e) {
		this.#input.value = this.#select.value;
		this.#select.value = "";
		this.#input.focus();
		Pageboard.trigger(this.#input, 'change');
	}

	destroy() {
		this.#select?.removeEventListener('change', this);
		this.#select?.remove();
	}
}

Pageboard.schemaHelpers['element-property'] = ElementProperty;

Pageboard.schemaHelpers['form-element'] = class FormElement extends ElementProperty {
	constructor(...args) {
		super(...args);
		this.existing = true;
	}
	pathsProperties(block, content) {
		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error(
			`DOM node not found for ${block.type}: ${block.id}`
		);
		const obj = {};
		for (const node of content.querySelectorAll("[name]")) {
			if (!node.name || this.dom != node && this.dom?.contains(node)) continue;
			obj[node.name] = {
				title: node.name
			};
		}
		return obj;
	}
};

Pageboard.schemaFilters['element-value'] = class ElementValueFilter {
	#using;

	constructor(key, opts) {
		this.#using = opts.using;
	}

	update(block, schema) {
		// TODO instead of requiring a schema from type,
		// infer a schema from current form inputs
		const empty = {
			title: schema.title,
			$filter: schema.$filter,
			type: "null"
		};
		const usingPath = this.#using.split('.');
		const key = usingPath.reduce((obj, name) => obj?.[name], block.data);
		if (!key) return empty;
		const path = key.split('.');

		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error(
			`Cannot create input, DOM node not found for block ${block.id}`
		);
		const prefix = dom.closest('[block-type="fieldset_list"]')?.prefix?.slice() ?? [];
		while (prefix.length) if (path[0] == prefix.shift()) path.shift();

		const formId = dom.closest('form')?.getAttribute('block-id');
		const formBlock = Pageboard.editor.blocks.get(formId);
		if (!formBlock) {
			console.warn("Cannot update element-value", block);
			return;
		}
		try {
			const el = ElementProperty.buildSchema(formBlock);
			const prop = path.reduce((obj, name) => {
				if (!obj) return;
				if (obj.type == "array" && obj.items && !Array.isArray(obj.items)) {
					obj = obj.items;
				}
				return obj?.properties?.[name];
			}, el);
			if (!prop) return empty;
			delete empty.type;
			return { ...prop, ...empty };
		} catch(err) {
			console.warn("Cannot update element-value", formBlock, err);
			return;
		}
	}
};
