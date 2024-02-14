class ElementProperty {
	#field;
	#input;
	#select;

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
			const prefix = ['data'];
			const paths = ElementProperty.asPaths(el, {}, prefix);
			prefix.shift();
			prefix.unshift('content');
			for (const content of el.contents?.list ?? []) {
				const cur = prefix.concat([content.id]);
				paths[cur.join('.')] = content;
			}
			return paths;
		} catch(err) {
			console.error(err);
		}
		return null;
	}

	#buildSelector(formBlock) {
		const content = Pageboard.editor.element(formBlock.type)
			.contents.get(formBlock);
		const formProps = this.pathsProperties(formBlock, content);
		if (!formProps) return;
		const formKeys = Object.keys(formProps);
		const mapKeys = new Map();
		const scope = Page.scope.copy();
		let currentPrefix;
		scope.$request = {};
		scope.$hooks = {
			after: {
				get(ctx, val, path) {
					if (ctx.expr.path[0] == "$request") {
						// requested
						let tail = ctx.expr.path.slice(1).join('.');
						if (tail) tail += ".";
						for (const key of formKeys) {
							if (key.startsWith(currentPrefix)) {
								mapKeys.set(key, tail + key.substring(currentPrefix.length));
							}
						}
					}
				}
			}
		};
		for (const [prefix, expr] of Object.entries(
			formBlock.expr?.action?.parameters ?? []
		)) {
			currentPrefix = prefix + '.';
			expr?.fuse({}, scope);
		}
		const doc = this.#input.ownerDocument;

		this.#select = doc.dom(`<select></select>`);
		const context = {
			level: 0,
			key: null,
			parent: this.#select
		};

		context.parent.appendChild(doc.dom(`<option hidden value=""></option>`));

		const dateFormats = ["date", "time", "date-time"];
		for (const [key, name] of mapKeys.entries()) {
			const prop = formProps[key];
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
				const node = doc.dom(`<option value="${name}">${prop.title}</option>`);
				context.parent.appendChild(node);
				if (!this.existing) node.disabled = Boolean(
					content.querySelector(`[name="${name}"]`)
				);
			}
		}
		if (mapKeys.size == 0) {
			context.parent.appendChild(doc.dom(`<option disabled>No inputs</option>`));
		}
		this.#field.insertBefore(this.#select, this.#input);
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


