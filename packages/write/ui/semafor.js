class Semafor {
	static formGet(form) {
		const query = new Map();
		for (let i = 0; i < form.elements.length; i++) {
			const elem = form.elements[i];
			const key = elem.name;
			if (!key) continue;
			if (key.startsWith('!')) continue;
			if (elem.disabled) {
				query.set(key, elem.parentNode.matches('.fieldset.nullable') ? {} : null);
				continue;
			}
			let old = query.get(key);
			let val;
			switch (elem.type) {
				case 'submit':
					break;
				case 'checkbox':
					if (elem.checked) {
						val = elem.value;
						if (old == null) old = undefined;
					} else if (old === undefined) {
						val = "";
					} else {
						val = null;
					}
					break;
				case 'radio':
					if (elem.checked) {
						old = undefined;
						val = elem.value;
					} else if (old === undefined) {
						val = "";
					} else {
						val = null;
					}
					break;
				case 'file':
					// skip
					break;
				case 'select-multiple':
					elem.selectedOptions.forEach((item, i) => {
						query.set(`${key}.${i}`, item.value);
					});
					break;
				default:
					val = elem.value;
			}
			if (val === "") val = null;
			if (old === undefined) {
				query.set(key, val);
			} else if (val != null) {
				if (!Array.isArray(old)) {
					old = [old];
					query.set(key, old);
				}
				if (!old.includes(val)) {
					old.push(val);
				}
			}
		}
		return query;
	}
	static formSet(form, values, obj) {
		function asPaths(obj, ret, pre) {
			obj ??= {};
			ret ??= {};
			for (const [key, val] of Object.entries(obj)) {
				const cur = `${pre || ""}${key}`;
				if (val == null || typeof val != "object" || Array.isArray(val) || val instanceof Map) {
					ret[cur] = val;
				} else if (typeof val == "object") {
					asPaths(val, ret, cur + '.');
				}
			}
			return ret;
		}
		const flats = asPaths(values, {});

		for (let i = 0; i < form.elements.length; i++) {
			const elem = form.elements[i];
			if (!elem.name) continue;
			if (elem.name.startsWith('!')) continue;
			let val = flats[elem.name];
			if (elem.parentNode.matches('.fieldset.nullable')) {
				const realVal = Semafor.findPath(obj, elem.name);
				elem.disabled = !realVal;
				for (const child of Array.from(elem.querySelectorAll('[name]'))) {
					child.disabled = elem.disabled;
				}
				elem.querySelector('input:not([name])').checked = Boolean(realVal);
				continue;
			}
			switch (elem.type) {
				case 'submit':
					break;
				case 'radio':
				case 'checkbox':
					if (val == null) val = [''];
					else if (!Array.isArray(val)) val = [val];
					elem.checked = val.some(val => val.toString() == elem.value);
					break;
				case 'select-one':
					if (val) {
						elem.value = val;
					}
					break;
				case 'select-multiple':
					if (val === undefined) {
						val = [];
						let subval;
						let k = 0;
						do {
							subval = flats[elem.name + '.' + k++];
							if (subval !== undefined) val.push(subval);
						} while (subval !== undefined);
					} else if (val == null) {
						val = [];
					} else if (!Array.isArray(val)) {
						val = [val];
					}
					elem.options.forEach(item => {
						item.selected = val.includes(item.value);
					});
					break;
				case 'file':
					if (val) elem.setAttribute("value", val);
					else elem.removeAttribute('value');
					break;
				default:
					elem.value = val ?? null;
			}
		}
	}

	constructor({ schema, node, filter, helper, schemas }) {
		this.filter = filter;
		this.helper = helper;
		// a json schema
		this.schema = cleanSchema(schema);
		this.schemas = schemas;
		this.node = node;
		this.node.classList.add('fieldset');
		this.fields = {};
		this.helpers = [];
	}

	destroy() {
		this.fields = {};
		this.node.textContent = '';
	}

	update(newSchema) {
		newSchema = cleanSchema(newSchema);
		const { node, fields, filteredSchema, helpers } = this;
		this.helpers = [];
		this.node = node.cloneNode();
		for (const { name, value } of node.attributes) {
			this.node.setAttribute(name, value);
		}
		this.fields = {};
		const originalFilteredSchema = filteredSchema && Pageboard.utils.stableStringify(filteredSchema);
		this.filteredSchema = this.process(null, newSchema || this.schema, this.node)?.shift();
		// adjust select[multiple][size]
		if (this.node.children.length == 1) {
			const selmul = this.node.querySelector('select[multiple]');
			if (selmul) selmul.size = selmul.options.length + 1;
		}
		if (originalFilteredSchema && originalFilteredSchema == Pageboard.utils.stableStringify(this.filteredSchema)) {
			this.node = node;
			this.fields = fields;
			this.helpers = helpers;
			return false;
		} else {
			for (const obj of this.helpers) this.helper(obj);
			node.textContent = '';
			while (this.node.firstChild) node.appendChild(this.node.firstChild);
			this.node = node;
			return true;
		}
	}

	get() {
		const vals = Semafor.formGet(this.node);
		const formVals = Semafor.unflatten(vals);
		return this.convert(formVals, this.filteredSchema) || {};
	}

	set(obj) {
		const vals = Semafor.flatten(obj, {}, this.filteredSchema);
		Semafor.formSet(this.node, vals, obj);
	}

	clear() {
		this.node.reset();
	}

	static types = {
		// json schema does not allow custom types - do not modify
	};

	static formats = {
		// json schema allows custom formats
	};

	static keywords = {
		// json schema allows custom keywords
	};

	static unflatten(map, obj) {
		if (!map) return map;
		if (!obj) obj = {};
		for (const [path, val] of map.entries()) {
			const list = path.split('.');
			let cur = obj;
			let prev = cur;
			list.forEach((key, i) => {
				const num = parseInt(key);
				if (!Number.isNaN(num) && key == num && !Array.isArray(cur)) {
					cur = [];
					prev[list[i - 1]] = cur = [];
				}
				if (cur?.[key] == null) {
					if (i < list.length - 1) {
						cur[key] = {};
					} else {
						cur[key] = val;
					}
				}
				if (cur?.[key] != null) {
					prev = cur;
					cur = cur[key];
				}
			});
		}
		return obj;
	}

	static stubSchema(tree) {
		const props = {};
		if (typeof tree == "object") Object.entries(tree).forEach(([key, val]) => {
			let schem;
			if (val != null && typeof val == "object") schem = {
				type: 'object',
				properties: this.stubSchema(val)
			};
			else schem = { type: 'string' };
			props[key] = schem;
		});
		return props;
	}
	static flatten(tree, obj, schema) {
		if (!tree) return tree;
		if (!obj) obj = {};
		const props = schema?.properties ?? this.stubSchema(tree);
		if (schema === undefined && props) schema = { properties: props };
		for (const key of Object.keys(props)) {
			let field = props[key];
			let val = tree[key];
			if (val == null) {
				if (field.default && field.anyOf) {
					// we want defaults to be checked
					val = field.default;
				} else if (field.properties) {
					val = {};
				}
			}
			if (val != null && typeof val == "object" && !(val instanceof Map)) {
				if (field && !field.properties && (field.oneOf || field.anyOf)) {
					const listNoNull = (field.oneOf || field.anyOf).filter(item => {
						return item.type != "null";
					});
					if (listNoNull.length == 1 && listNoNull[0].properties) {
						field = listNoNull[0];
					}
				}
				if (schema !== undefined) {
					if (field?.type == "array") {
						let allStrings = false;
						if (field.items?.anyOf) {
							if (field.items.anyOf.every(item => item.const !== undefined)) {
								obj[key] = val;
								continue;
							}
							allStrings = field.items.anyOf.every(
								(item) => item.type == "string"
							);
						}
						if (field.items?.type == "string") {
							allStrings = true;
						}
						if (allStrings) {
							if (typeof val == "string") val = [val];
							if (Array.isArray(val)) {
								obj[key] = val.join('\n');
							} else {
								obj[key] = val;
							}
							continue;
						}
						for (const [k, kval] of Object.entries(Semafor.flatten(val, {}))) {
							obj[`${key}.${k}`] = kval;
						}
						continue;
					} else if (!field?.properties && !field.oneOf && !field.anyOf) {
						obj[key] = Object.isEmpty(val) ? null : new Map(Object.entries(val));
						continue;
					}
				} else {
					console.warn("no schema", key, val);
				}
				for (const [k, kval] of Object.entries(Semafor.flatten(val, {}, field))) {
					obj[`${key}.${k}`] = kval;
				}
			} else {
				obj[key] = val;
			}
		}
		return obj;
	}

	convert(vals, schema) {
		const obj = {};
		if (vals == null) return obj;
		let allNulls = true;
		for (const name of Object.keys(vals)) {
			let field = schema.properties[name];
			let val = vals[name];
			if (!field) {
				console.error("Cannot find schema for property", name, "of", schema);
			}
			let type = field.type;
			let nullable = Boolean(field.nullable);
			const listOf = Array.isArray(type) && type
				|| Array.isArray(field.oneOf) && field.oneOf
				|| Array.isArray(field.anyOf) && field.anyOf
				|| null;

			if (listOf && !field.properties) {
				// we support promotion to null and that's it
				const listOfNo = listOf.filter(item => {
					if (typeof item == "string") {
						return item != "null";
					} else {
						return item.type != "null";
					}
				});
				if (listOfNo.length != listOf.length) {
					nullable = true;
				}
				if (listOfNo.length == 1) {
					type = listOfNo[0].type || listOfNo[0];
				} else if (listOfNo.every(item => item.const !== undefined)) {
					// nothing
				} else if (listOfNo.every(item => {
					return item == "string" || item.type === undefined || item.type == "string";
				})) {
					type = "string";
				} else {
					console.warn("Unsupported type in schema:", field);
				}
			}
			switch (type) {
				case "integer":
					val = parseInt(val);
					if (Number.isNaN(val)) val = undefined;
					break;
				case "number":
					val = parseFloat(val);
					if (Number.isNaN(val)) val = undefined;
					break;
				case "boolean":
					val = val == "true";
					if (!val && !field.default) val = undefined;
					break;
				case "object":
					if (!field.properties) {
						if (field.oneOf || field.anyOf) {
							const listNoNull = (field.oneOf || field.anyOf).filter(
								(item) => item.type != "null"
							);
							if (listNoNull.length == 1 && listNoNull[0].properties) {
								field = listNoNull[0];
							}
						} else if (val instanceof Map) {
							val = Object.fromEntries(val.entries());
						}
					} else {
						val = this.convert(val, field);
					}
					if (val == null && !nullable) val = {};
					break;
				case "array":
					if (typeof val == "string") {
						val = val.split('\n').filter(str => str.length > 0);
					}
					break;
				case "string":
					if (nullable && val === "") val = null;
					break;
				default:
					if (!listOf) console.warn("Unsupported schema type in convert", field);
					break;
			}
			if (val != null) allNulls = false;
			if (val != null || field.default != null && nullable) obj[name] = val;
		}
		if (allNulls) return;
		return obj;
	}
	process(key, schema, node, parent) {
		schema = this.resolveRef(schema);
		if (schema.properties && !schema.type) {
			schema.type = 'object';
		}
		if (this.filter) {
			schema = this.filter(key, schema, parent) || schema;
		}
		const type = getNonNullType(schema.type);
		let noHelper = false;
		let fieldset;
		if (schema.oneOf || schema.anyOf) {
			fieldset = Semafor.types.oneOf(key, schema, node, this);
		} else if (type && Semafor.types[type]) {
			if (type == 'object') {
				Semafor.types.object(key, schema, node, this);
			} else if (!schema.title) {
				fieldset = Semafor.types.hidden(key, schema, node, this);
				noHelper = true;
			} else if (type == "array") {
				fieldset = Semafor.types[type](key, schema, node, this);
			} else if (!key) {
				console.error('Properties of type', type, 'must have a name');
			} else {
				const field = this.fields[key] = {};
				field.identifier = key; // TODO check if really needed
				field.rules = [];
				if (schema.format && Semafor.formats[schema.format]) {
					field.rules.push(Semafor.formats[schema.format](schema));
				}
				if (schema.required && schema.required.indexOf(key) >= 0) { // TODO problem key != name if nested
					field.rules.push({ type: 'empty' });
				} else {
					field.optional = true;
				}
				for (const [kw, vw] of Object.entries(schema)) {
					if (Semafor.keywords[kw]) field.rules.push(Semafor.keywords[kw](vw));
				}
				fieldset = Semafor.types[type](key, schema, node, this);
			}
		} else if (Array.isArray(type)) {
			fieldset = node.appendChild(node.dom(`<div class="fieldset"></div>`));
			for (const stype of type) {
				Semafor.types[stype](key, schema, fieldset, this);
			}
		} else if (schema.const != null) {
			fieldset = Semafor.types.const(key, schema, node, this);
		} else if (type != null) {
			console.warn(key, 'has no supported type in schema', schema);
		}
		if (fieldset) {
			fieldset.classList.toggle('disabled', Boolean(schema.$disabled));
		}
		if (key && this.helper && !noHelper) {
			this.helpers.push({ key, prop: schema, node, parentProp: parent });
		}
		return [schema, fieldset];
	}

	handleEvent(e) {
		if (e.type != "change") return;
		const legend = e.target.closest('fieldset > legend');
		if (!legend) return;
		const fieldset = legend.parentNode;
		if (!fieldset) return;
		const bool = !e.target.checked;
		let node;
		fieldset.disabled = bool;
		for (node of fieldset.querySelectorAll('[name]:not(.nullable > fieldset)')) {
			node.disabled = bool;
		}
		if (node) node.dispatchEvent(new Event("change", {
			bubbles: true,
			cancelable: true
		}));
	}

	resolveRef(schema, parentId) {
		if (!schema) return schema;
		const { $ref } = schema;
		if (!$ref) return schema;
		const refUrl = new URL($ref, "http://a.a" + parentId);
		const root = this.schemas[refUrl.pathname.substring(1) || 'elements'];
		if (!root) console.error("Unsupported $ref", $ref);
		const prefix = '#/definitions/';
		if (refUrl.hash.startsWith(prefix)) {
			delete schema.$ref;
			const [name, ...rel] = refUrl.hash.slice(prefix.length).split('/');
			let ref = root.definitions[name];
			if (rel.length >= 2 && rel[0] != 'properties' && rel[1] != 'data') {
				console.error("Cannot resolve", $ref);
			} else {
				ref = rel.slice(2).reduce((schema, key) => schema[key], ref);
				if (ref) Object.assign(schema, ref);
				else console.error("$ref not found", $ref);
			}
		} else if (refUrl.searchParams.size > 0) {
			const list = [];
			const entries = Array.from(refUrl.searchParams.entries());
			for (const item of root.oneOf) {
				const schema = this.resolveRef(item, root.$id);
				if (entries.every(([key, val]) => schema[key] == val)) {
					list.push(schema);
				}
			}
			delete schema.$ref;
			schema.required = root.required;
			schema.oneOf = list;
			if (root.discriminator) schema.discriminator = root.discriminator;
		} else {
			Object.assign(schema, root);
		}
		return schema;
	}

	static findPath(obj, path) {
		const list = path.split('.');
		let cur = obj;
		while (cur != null && typeof cur == "object" && list.length) {
			cur = cur[list.shift()];
		}
		return cur;
	}
}

function getNonNullType(type) {
	if (!type || !Array.isArray(type)) return type;
	if (type.length != 2) return type;
	if (type[0] == "null") return type[1];
	if (type[1] == "null") return type[0];
	return type;
}


Semafor.types.hidden = function (key, schema, node, inst) {
	return node.appendChild(node.dom(`<input name="${key}" type="hidden" />`));
};

Semafor.types.string = function (key, schema, node, inst) {
	const multiline = !schema.pattern && !schema.format;
	const short = schema.maxLength != null && schema.maxLength <= 10 || ["singleline", "id", "lang"].includes(schema.format);
	if (multiline && !short) {
		return node.appendChild(node.dom(`<div class="field">
			<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
			<textarea name="[$key]"	placeholder="[placeholder|else:default]" is="semafor-textarea"></textarea>
		</div>`).fuse(schema, { $key: key }));
	} else if (short) {
		return node.appendChild(node.dom(`<div class="short inline field">
			<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
			<input type="text" name="[$key]" placeholder="[placeholder|else:default]"
			/>
		</div>`).fuse(schema, { $key: key }));
	} else {
		const field = node.appendChild(node.dom(`<div class="field">
			<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
			<input type="text" name="[$key]"
				placeholder="[placeholder|else:default]"
			/>
		</div>`).fuse(schema, { $key: key }));
		const input = field.lastElementChild;
		const typeFormats = {
			date: "date",
			time: "time",
			"date-time": "datetime-local"
		};
		const typeFormat = typeFormats[schema.format];
		if (typeFormat) input.type = typeFormat;
		return field;
	}
};

Semafor.types.oneOf = function (key, schema, node, inst) {
	const listOf = (schema.oneOf || schema.anyOf).slice();
	let { nullable } = schema;
	let hasNullOption = false;
	const alts = listOf.filter(item => {
		if (item.type == "null") {
			nullable = true;
			hasNullOption = true;
			return false;
		} else {
			return true;
		}
	});

	const def = schema.default === null ? "" : schema.default;
	const scope = {
		$key: key,
		$def: def,
		$list: listOf
	};
	let oneOfType;
	let icons = false;
	const disc = schema.discriminator?.propertyName;
	if (alts.length == 0) {
		// do nothing
	} else if (disc) {
		scope.$list = listOf.map(item => {
			item = inst.resolveRef(item, schema.$id); // often needed here
			return item.properties[disc];
		});
		scope.$key += `.${disc}`;
	} else if (alts.length == 1 && alts[0].const === undefined) {
		oneOfType = alts[0];
	} else if (alts.every(item => Boolean(item.icon))) {
		icons = true;
	} else if (alts.every(item => item.const !== undefined)) {
		// do nothing
	} else if (alts.every(item => item.type == "string")) {
		oneOfType = { type: 'string', format: 'singleline' };
	} else if (
		alts.some(item => (item == "string" || item.type === undefined || item.type == "string"))
	) {
		console.error("Unsupported schema replaced by string type:", schema);
		oneOfType = { type: 'string', format: 'singleline' };
	}
	if (oneOfType) {
		// la valeur de retour de process n'est pas un fieldset
		return inst.process(key, {
			...schema,
			oneOf: null,
			anyOf: null,
			nullable,
			...oneOfType
		}, node, schema)?.pop();
	}

	if (nullable && !hasNullOption) {
		if (icons) {
			listOf.splice(0, 0, {
				const: null,
				icon: '<i class="close icon"></i>',
				title: 'None'
			});
		} else {
			listOf.splice(0, 0, {
				const: null,
				title: 'None'
			});
		}
	}
	let field;
	if (icons) {
		field = node.dom(`<div class="inline fields">
			<label for="[$key]">[title|else:$key]<small>[description|as:text|fail:*]</small></label>
			<div class="ui compact icon menu">
				<label class="ui radio checkbox item">
					<input type="radio" name="[$key]" value="[$list|at:label|repeat:item|.const|or:]" checked="[item.const|eq:$def]">
					<span>[item.icon|as:html]</span>
					<small>[item.description|fail:*]</small>
				</label>
			</div>
		</div>`).fuse(schema, scope);
		node.appendChild(field);
	} else if (listOf.length <= 3) {
		field = node.dom(`<div class="inline fields rtl">
			<label for="[$key]">[title|else:$key]<small>[description|as:text|fail:*]</small></label>
			<div class="inline field">
				<label class="ui radio checkbox">
					<input type="radio" name="[$key]" value="[$list|at:div|repeat:item|.const|or:]" checked="[item.const|eq:$def]">
					<span>[item.title]</span>
					<small>[item.description]</small>
				</label>
			</div>
		</div>`).fuse(schema, scope);
		node.appendChild(field);
	} else {
		field = node.dom(`<div class="inline field">
			<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
			<select name="[$key]" class="ui compact dropdown">
				<option value="[$list|repeat:item|.const|or:]" selected="[item.const|eq:$def]">[item.title|else:item.const]</option>
			</select>
		</div>`).fuse(schema, scope);
		node.appendChild(field);
	}
	return field;
};

Semafor.types.integer = function (key, schema, node, inst) {
	schema = { ...schema };
	if (!schema.multipleOf) schema.multipleOf = 1;
	const field = Semafor.types.number(key, schema, node, inst);
	inst.fields[key].type = 'integer';
	return field;
};

Semafor.types.number = function (key, schema, node, inst) {
	const field = node.appendChild(node.dom`<div class="inline field">
		<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
		<input type="number" name="[$key]"
			placeholder="[default]"
			min="[minimum]"
			max="[maximum]"
			step="[multipleOf]"
		/>
	</div>`.fuse(schema, { $key: key }));
	//
	inst.fields[key].type = 'number';
	return field;
};

Semafor.types.object = function (key, schema, node, inst) {
	let fieldset;
	if (schema.title) {
		if (schema.properties && key) {
			if (Object.values(schema.properties).every(item => item.type == "boolean")) {
				fieldset = node.dom(`<div class="inline fields">
					<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
					<div>[properties|as:entries|at:-|repeat:item:semafor:boolean]</div>
				</div>`).fuse(schema, {
					$key: key,
					$filters: {
						semafor(ctx, { key: sub, value: item }, cursor, fragment, type) {
							Semafor.types[type](`${key}.${sub}`, item, fragment);
							cursor.before(fragment);
						}
					}
				});
				node.appendChild(fieldset);
				return;
			}
			if (schema.nullable) {
				fieldset = node.dom(`<div class="nullable fieldset">
					<fieldset name="[$key]" class="field" disabled>
						<legend>
							<label class="checkbox">
								<input type="checkbox">
								<span>[title]</span>
								<small>[description|as:text|fail:*]</small>
							</label>
						</legend>
					</fieldset>
				</div>`).fuse(schema, { $key: key });
				node.appendChild(fieldset);
				fieldset = fieldset.lastElementChild;
				fieldset.querySelector('input:not([name])').addEventListener('change', inst);
			} else {
				fieldset = node.dom(`<fieldset name="[$key]" class="field">
					<legend>[title]<small>[description|as:text|fail:*]</small></legend>
				</fieldset>`).fuse(schema, { $key: key });
				node.appendChild(fieldset);
			}
		} else if (key) {
			fieldset = node.dom(`<div class="long field">
				<label>[title|else:$key]<small>[description|as:text|fail:*]</small></label>
				<input is="element-input-map" name="[$key]" />
			</div>`).fuse(schema, { $key: key });
			node.appendChild(fieldset);
		}
	}
	if (schema.properties) {
		const props = {};
		const prefix = key ? (key + '.') : '';
		for (const [name, propSchema] of Object.entries(schema.properties)) {
			props[name] = inst.process(prefix + name, propSchema, fieldset ?? node, schema.properties)?.shift() || propSchema;
		}
		schema.properties = props;
	}
	return fieldset;
};

Semafor.types.boolean = function (key, schema, node, inst) {
	node.appendChild(node.dom`<div class="field">
		<label class="toggle checkbox">
			<span>[title|else:$key]</span>
			<input type="checkbox" name="[$key]" value="true" checked="[default]" />
			<small>[description|as:text|fail:*]</small>
		</label>
	</div>`.fuse(schema, { $key: key }));
};

Semafor.types.null = function (key, schema, node, inst) {
	// a lone type null means just ignore this
};

Semafor.types.array = function (key, schema, node, inst) {
	if (schema.nullable) {
		const fieldset = node.dom(`<div class="nullable array fieldset">
			<fieldset class="field" disabled name="[$key]">
				<legend>
					<label class="checkbox">
						<input type="checkbox">
						<span>[title]</span>
						<small>[description|as:text|fail:*]</small>
					</label>
				</legend>
			</fieldset>
		</div>`).fuse(schema, { $key: key });
		node = node.appendChild(fieldset).lastElementChild;
		node.querySelector('input:not([name])').addEventListener('change', inst);
	} else {
		const fieldset = node.dom(`<fieldset class="array fieldset">
			<legend>[title]<small>[description|as:text|fail:*]</small></legend>
		</fieldset>`).fuse(schema, { $key: key });
		node = node.appendChild(fieldset);
	}
	const items = inst.resolveRef(schema.items);
	if (Array.isArray(items)) {
		items.forEach((item, i) => {
			inst.process(`${key}.${i}`, item, node, schema);
		});
		return node;
	} else if (items.type == "string") {
		return Semafor.types.string(key, schema, node, inst);
	} else if (items.anyOf) {
		const allStrings = items.anyOf.every(item => {
			return item.type == "string";
		});
		if (allStrings) {
			return Semafor.types.string(key, schema, node, inst);
		} else if (items.anyOf) {
			const fields = node.dom(`<div class="inline fields rtl">
				<div class="inline field">
					<label class="ui checkbox">
						<input type="checkbox" name="[$key]" value="[items.anyOf|at:div|repeat:item|.const]">
						<span>[item.title]</span>
						<small>[item.description]</small>
					</label>
				</div>
			</div>`).fuse(schema, { $key: key });
			node.appendChild(fields);
			return fields;
		} else {
			return node.appendChild(node.dom(`<div class="inline field">
				<select multiple name="[$key]">
					<option value="[items.anyOf|repeat:item|.const|or:]">[item.title|else:item.const]</option>
				</select>
			</div>`).fuse(schema, { $key: key }));
		}
	} else {
		console.warn("FIXME: array type supports only items: [schemas], or items.anyOf", schema);
		return inst.process(key, {
			...items,
			title: schema.title
		}, node, schema)?.pop();
	}
};

Semafor.types.const = function (key, schema, node, inst) {
	schema = { ...schema };
	schema.pattern = new RegExp(schema.const);
	schema.placeholder = schema.const;
	if (schema.title) schema.title = `> ${schema.title}`;
	const field = Semafor.types.string(key, schema, node, inst);
	const input = field.querySelector('input');
	if (!schema.title) field.classList.add('hidden');
	else input.hidden = true;
	input.setAttribute('value', schema.const);
	return field;
};

Semafor.formats.email = function () {
	return {
		type: 'email'
	};
};

Semafor.formats.uri = function () {
	return {
		type: 'url'
	};
};

Semafor.formats['uri-reference'] = function () {
	return {
		type: 'url'
	};
};

Semafor.formats.pathname = function () {
	return {
		type: 'regExp',
		value: /^(\/[\w-.]*)+$/
	};
};

Semafor.formats.singleline = function () {
	return {
		type: 'regExp',
		value: /^[^\n\r]*$/
	};
};

Semafor.formats.id = function () {
	return {
		type: 'regExp',
		value: /^[\w-]+$/
	};
};

Semafor.keywords.pattern = function (value) {
	return {
		type: 'regExp',
		value: new RegExp(value)
	};
};

Semafor.getValStr = function (item) {
	if (item.const === undefined && item.type != "null") {
		console.error("non-const/non-null oneOf/anyOf");
	}
	return item.const != null ? item.const : '';
};

Pageboard.Semafor = Semafor;

function cleanSchema(obj) {
	return {
		title: obj.title,
		description: obj.description,
		oneOf: obj.oneOf,
		anyOf: obj.anyOf,
		type: obj.type,
		properties: obj.properties
	};
}
