class ElementProperty {
	#field;
	#input;
	#select;
	#formBlock;

	constructor(input, opts, props) {
		this.#field = input.closest('.field');
		this.#field.classList.add('inline', 'datalist');
		this.#input = input;
	}

	static contentAsSchema(list = []) {
		const props = {};
		for (const prop of list) {
			props[prop.id] = {
				title: prop.title
			};
		}
		return props;
	}

	static asPaths(obj, ret, prefix = []) {
		if (!ret) ret = {};
		const [discKey, discList] = this.discriminator(obj) ?? [];
		if (discKey) {
			// FIXME shouldn't be this simply resolved by semafor ?
			const discProp = obj.properties?.[discKey];
			for (const [discValue, subSchema] of discList) {
				const discCase = (discProp?.oneOf ?? discProp?.anyOf ?? []).find(it => {
					return it.const == discValue;
				});
				const subRet = {};
				this.asPaths(subSchema, subRet, prefix.concat([discKey, discValue]));
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
				this.asPaths(val, ret, cur);
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

	init(block, prop, semafor) {
		this.semafor = semafor;
		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error(
			`Cannot create input, DOM node not found for block ${block.id}`
		);
		this.dom = dom;
		const form = dom.closest('form');
		const formId = form.getAttribute('block-id');
		const formBlock = Pageboard.editor.blocks.get(formId);
		if (!formBlock) throw new Error("Cannot find form block for " + formId);
		this.#formBlock = formBlock;
		this.#buildSelector(formBlock);
	}

	static buildSchema(block) {
		let types = null;
		if (block.type == "query_form") {
			types = block.data?.type;
			if (!types) return;
		} else if (block.type == "api_form") {
			types = block.data?.action?.parameters?.type;
			if (!types) {
				const method = block.data?.action?.method;
				if (method) {
					const service = Pageboard.schemas.services.definitions[method];
					return service.properties.parameters;
				} else {
					return;
				}
			}
		}

		if (Array.isArray(types)) {
			const list = types.map(type => {
				const el = Pageboard.editor.element(type);
				if (!el) throw new Error(
					`Unknown type in parent form ${block.type}: ${type}`
				);
				return {
					const: type,
					title: el.title
				};
			});
			return {
				type: 'object',
				properties: {
					type: {
						title: 'Type',
						anyOf: list
					}
				}
			};
		}

		const el = Pageboard.editor.element(types);
		if (!el) throw new Error(
			`Unknown type in parent form ${block.type}: ${types}`
		);
		return {
			title: el.title,
			type: 'object',
			properties: {
				data: { type: 'object', properties: el.properties },
				content: { title: 'Content', type: 'object', properties: this.contentAsSchema(el.contents?.list) }
			}
		};
	}

	pathsProperties(block) {
		try {
			const el = this.semafor.resolveRef(ElementProperty.buildSchema(block));
			if (!el) return null;
			return ElementProperty.asPaths(el, {});
		} catch(err) {
			console.error(err);
		}
		return null;
	}

	#trackFuse(formKeys, mapKeys, obj, scope, prefix) {
		scope.$request = {};
		let curPrefix;
		scope.$hooks = {
			after: {
				get(ctx, val, path) {
					const root = ctx.expr.path;
					if (root[0] == "$request") {
						// requested
						const tail = root.slice(1).join('.');
						for (const key of formKeys) {
							if (key == curPrefix || key.startsWith(curPrefix) && key[curPrefix.length] == ".") {
								mapKeys.set(key, tail + key.substring(curPrefix.length));
							}
						}
					} else if (root[0] == "$default" && root.length == 1) {
						// curPrefix is banned from mapKeys
						const index = formKeys.indexOf(curPrefix);
						if (index >= 0) formKeys.splice(index, 1);
					}
				}
			}
		};
		for (const [key, expr] of Object.entries(obj)) {
			curPrefix = prefix ? prefix + '.' + key : key;
			if (expr == null) continue;
			else if (typeof expr == "string") expr?.fuse({}, scope);
			else this.#trackFuse(formKeys, mapKeys, expr, scope, curPrefix);
		}
	}

	#buildSelector(formBlock) {
		const content = Pageboard.editor.element(formBlock.type)
			.contents.get(formBlock);
		const formProps = this.pathsProperties(formBlock, content);
		if (!formProps) return;
		const mapKeys = new Map();
		const scope = Page.scope.copy();
		this.#trackFuse(Object.keys(formProps), mapKeys, formBlock.data.action?.request ?? {}, scope);

		const doc = this.#input.ownerDocument;

		this.#select = doc.dom(`<select></select>`);
		const context = {
			level: 0,
			key: null,
			parent: this.#select
		};

		context.parent.appendChild(doc.dom(`<option hidden value=""></option>`));

		const dateFormats = ["date", "time", "date-time"];
		const sortedKeys = Array.from(mapKeys.keys()).sort((a, b) => {
			return a.localeCompare(b);
		});
		for (const key of sortedKeys) {
			const name = mapKeys.get(key);
			const prop = formProps[key];
			const parts = key.split('.');
			const pkey = parts.slice(0, -1).join('.');
			if (!prop.title) continue;
			if (context.key && context.key != pkey) {
				context.level++;
				context.key = pkey;
				context.parent = context.parent.parentNode || context.parent;
			}
			if (prop.type == "object" && prop.properties && !(Object.keys(prop.properties).sort().join(' ') == "end start" && dateFormats.includes(prop.properties.start.format) && dateFormats.includes(prop.properties.end.format))) {
				context.parent = this.#select.appendChild(
					doc.dom(`<optgroup label="${prop.title}"></optgroup>`)
				);
				context.level--;
				context.key = key;
			} else if (prop.type == "array" && prop.items?.properties) {
				context.parent = this.#select.appendChild(
					doc.dom(`<optgroup label="${prop.title}"></optgroup>`)
				);
				context.level--;
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

	update(block) {
		const content = Pageboard.editor.element(this.#formBlock.type)
			.contents.get(this.#formBlock);
		for (const node of this.#select) {
			if (node.value) node.disabled = Boolean(
				content.querySelector(`[name="${node.value}"]`)
			);
		}
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


