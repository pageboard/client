/* global $ */
(function() {

window.Semafor = Semafor;

function Semafor(schema, node, filter, helper) {
	this.filter = filter;
	this.helper = helper;
	// a json schema
	this.schema = schema;
	// a jquery node selector
	this.$node = $(node);
	this.node = node;
	this.node.classList.add('fieldset');
	this.fields = {};
}

function formGet(form) {
	const query = {};
	for (let i = 0; i < form.elements.length; i++) {
		const elem = form.elements[i];
		const key = elem.name;
		if (!key) continue;
		if (key.startsWith('$')) continue;
		if (elem.disabled) {
			query[key] = null;
		} else {
			const fieldset = elem.closest('fieldset');
			if (fieldset && fieldset.disabled) continue;
		}
		let old = query[key];
		let val;
		switch (elem.type) {
		case 'submit':
			break;
		case 'checkbox':
			val = elem.checked ? elem.value : "";
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
			elem.selectedOptions.forEach(function(item, i) {
				query[`${key}.${i}`] = item.value;
			});
			break;
		default:
			val = elem.value;
		}
		if (val == null) continue;
		if (old !== undefined) {
			if (!Array.isArray(old)) {
				query[key] = [old];
			}
			query[key].push(val);
		} else {
			query[key] = val;
		}
	}
	return query;
}

function formSet(form, values, obj) {
	function asPaths(obj, ret, pre) {
		if (!ret) ret = {};
		Object.entries(obj).forEach(function([key, val]) {
			const cur = `${pre || ""}${key}`;
			if (val == null || typeof val != "object") {
				ret[cur] = val;
			} else if (typeof val == "object") {
				asPaths(val, ret, cur + '.');
			}
		});
		return ret;
	}
	const flats = asPaths(values, {});

	for (let i = 0; i < form.elements.length; i++) {
		const elem = form.elements[i];
		if (!elem.name) continue;
		if (elem.name.startsWith('$')) continue;
		let val = flats[elem.name];
		if (elem.parentNode.matches('.fieldset.nullable')) {
			const realVal = Semafor.findPath(obj, elem.name);
			elem.disabled = !realVal;
			elem.previousElementSibling.checked = !!realVal;
		}
		switch (elem.type) {
		case 'submit':
			break;
		case 'radio':
		case 'checkbox':
			if (val == null) val = [''];
			else if (!Array.isArray(val)) val = [val];
			elem.checked = val.some(function(val) {
				return val.toString() == elem.value;
			});
			// TODO it's preferable if this line is not needed
			elem.parentNode.classList.toggle('checked', elem.checked);
			break;
		case 'select-one':
			if (val) {
				elem.value = val;
				$(elem.closest('.dropdown')).dropdown({placeholder: false});
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
			}	else if (!Array.isArray(val)) {
				val = [val];
			}
			elem.options.forEach(function(item) {
				item.selected = val.includes(item.value);
			});
			$(elem.closest('.dropdown')).dropdown({placeholder: false});
			break;
		case 'file':
			if (val) elem.setAttribute("value", val);
			break;
		default:
			if (val) elem.value = val;
		}
	}
}

Semafor.prototype.destroy = function() {
	this.$node.find('.dropdown').dropdown('hide').dropdown('destroy');
	this.$node.find('.checkbox').checkbox('destroy');
	this.node.querySelectorAll('.nullable.fieldset > .nullable').forEach((node) => {
		node.removeEventListener('change', this);
	});
	this.$node.form('destroy');
	this.fields = {};
	this.node.textContent = '';
};

Semafor.prototype.update = function(newSchema) {
	this.destroy();
	this.lastSchema = this.process(null, newSchema || this.schema, this.node);

	this.$node.form({
		on: 'blur',
		fields: this.fields,
		keyboardShortcuts: false
	});
};

Semafor.prototype.get = function() {
	const vals = formGet(this.$node[0]);
	const formVals = Semafor.unflatten(vals);
	return this.convert(formVals, this.lastSchema);
};

Semafor.prototype.set = function(obj) {
	const vals = Semafor.flatten(obj, {}, this.lastSchema);
	formSet(this.$node[0], vals, obj);
};

Semafor.prototype.clear = function() {
	this.$node[0].reset();
};

const types = Semafor.types = {
	// json schema does not allow custom types - do not modify
};

const formats = Semafor.formats = {
	// json schema allows custom formats
};

const keywords = Semafor.keywords = {
	// json schema allows custom keywords
};

Semafor.unflatten = function(map, obj) {
	if (!map) return map;
	if (!obj) obj = {};
	Object.keys(map).forEach(function(key) {
		const list = key.split('.');
		let val = obj;
		let prev = val;
		list.forEach(function(sub, i) {
			const num = parseInt(sub);
			if (!Number.isNaN(num) && sub == num && !Array.isArray(val)) {
				val = [];
				prev[list[i - 1]] = val = [];
			}
			if (!val[sub]) {
				if (i < list.length - 1) val[sub] = {};
				else val[sub] = map[key];
			}
			prev = val;
			val = val[sub];
		});
	});
	return obj;
};

function stubSchema(tree) {
	const props = {};
	if (typeof tree == "object") Object.entries(tree).forEach(([key, val]) => {
		let schem;
		if (val != null && typeof val == "object") schem = {
			type: 'object',
			properties: stubSchema(val)
		};
		else schem = {type: 'string'};
		props[key] = schem;
	});
	return props;
}

Semafor.flatten = function(tree, obj, schema) {
	if (!tree) return tree;
	if (!obj) obj = {};
	const props = schema && schema.properties || stubSchema(tree);
	if (schema === undefined && props) schema = {properties: props};
	Object.entries(props).forEach(function([key, field]) {
		let val = tree[key];
		if (val == null) {
			if (field.default && field.anyOf) {
				// we want defaults to be checked
				val = field.default;
			} else if (field.properties) {
				val = {};
			}
		}
		if (val != null && typeof val == "object") {
			if (field && !field.properties && (field.oneOf || field.anyOf)) {
				const listNoNull = (field.oneOf || field.anyOf).filter(function(item) {
					return item.type != "null";
				});
				if (listNoNull.length == 1 && listNoNull[0].properties) {
					field = listNoNull[0];
				}
			}
			if (schema !== undefined) {
				if (field && field.type == "array") {
					let allStrings = false;
					if (field.items && field.items.anyOf) {
						allStrings = field.items.anyOf.every(function(item) {
							return item.type == "string";
						});
					}
					if (field.items && field.items.type == "string") {
						allStrings = true;
					}
					if (allStrings) {
						if (typeof val == "string") val = [val];
						if (Array.isArray(val)) {
							obj[key] = val.join('\n');
						} else {
							obj[key] = val;
						}
						return;
					}
					Object.entries(Semafor.flatten(val, {})).forEach(function([k, kval]) {
						obj[`${key}.${k}`] = kval;
					});
					return;
				} else if (!field || !field.properties) {
					obj[key] = JSON.stringify(val);
					return;
				}
			} else {
				console.warn("no schema", key, val);
			}
			Object.entries(Semafor.flatten(val, {}, field)).forEach(function([k, kval]) {
				obj[`${key}.${k}`] = kval;
			});
		} else {
			obj[key] = val;
		}
	}, this);
	return obj;
};

Semafor.prototype.convert = function(vals, field) {
	const obj = {};
	const schema = field.properties;
	for (let name in vals) {
		field = schema[name];
		let val = vals[name];
		if (field) {
			let type = field.type;
			const listOf = Array.isArray(type) && type
				|| Array.isArray(field.oneOf) && field.oneOf
				|| Array.isArray(field.anyOf) && field.anyOf
				|| null;
			let nullable = false;
			if (listOf && !field.properties) {
				// we support promotion to null and that's it
				const listOfNo = listOf.filter(function(item) {
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
				} else if (listOfNo.every(function(item) {
					return item.const !== undefined;
				})) {
					// nothing
				} else if (listOfNo.every(function(item) {
					return item == "string" || item.type === undefined || item.type == "string";
				})) {
					type = "string";
				} else {
					console.warn("Unsupported type in schema", field);
				}
			}
			switch(type) {
			case "integer":
				val = parseInt(val);
				if (Number.isNaN(val) && nullable) val = null;
				break;
			case "number":
				val = parseFloat(val);
				if (Number.isNaN(val) && nullable) val = null;
				break;
			case "boolean":
				if (val === "" && nullable) val = null; // not really useful
				val = val == "true";
				break;
			case "object":
				if (!field.properties && (field.oneOf || field.anyOf)) {
					const listNoNull = (field.oneOf || field.anyOf).filter(function(item) {
						return item.type != "null";
					});
					if (listNoNull.length == 1 && listNoNull[0].properties) {
						field = listNoNull[0];
					}
				}
				if (!field.properties) {
					try {
						val = val ? JSON.parse(val) : val;
					} catch(ex) {
						console.error(ex);
					}
				} else {
					val = this.convert(val, field);
				}
				if (Object.keys(val).length == 0 && nullable) val = null;
				break;
			case "array":
				if (typeof val == "string") {
					val = val.split('\n').filter(function(str) {
						return str.length > 0;
					});
				}
				break;
			default:
				if (nullable && val === "") val = null;
				break;
			}
		}
		obj[name] = val;
	}
	return obj;
};

function getNonNullType(type) {
	if (!type || !Array.isArray(type)) return type;
	if (type.length != 2) return type;
	if (type[0] == "null") return type[1];
	if (type[1] == "null") return type[0];
	return type;
}
Semafor.prototype.process = function(key, schema, node, parent) {
	if (this.filter) {
		schema = this.filter(key, schema, parent) || schema;
	}
	const type = getNonNullType(schema.type);
	let hasHelper = false;
	if (schema.oneOf || schema.anyOf) {
		hasHelper = !!types.oneOf(key, schema, node, this);
	} else if (type && types[type]) {
		if (type == 'object') {
			types.object(key, schema, node, this);
		} else if (!schema.title) {
			hasHelper = true;
			types.hidden(key, schema, node, this);
		} else if (!key) {
			console.error('Properties of type', type, 'must have a name');
		} else {
			const field = this.fields[key] = {};
			field.identifier = key; // TODO check if really needed
			field.rules = [];
			if (schema.format && formats[schema.format]) {
				field.rules.push(formats[schema.format](schema));
			}
			if (schema.required && schema.required.indexOf(key) >= 0) { // TODO problem key != name if nested
				field.rules.push({type: 'empty'});
			} else {
				field.optional = true;
			}
			Object.keys(schema).forEach(function(kw) {
				if (keywords[kw]) field.rules.push(keywords[kw](schema[kw]));
			});
			types[type](key, schema, node, this);
		}
	} else if (Array.isArray(type)) {
		type.forEach(function(type) {
			types[type](key, schema, node, this);
		});
	} else if (schema.const != null) {
		types.const(key, schema, node, this);
	} else {
		console.warn(key, 'has no supported type in schema', schema);
	}
	if (key && this.helper && !hasHelper) {
		schema = this.helper(key, schema, node, parent) || schema;
	}
	return schema;
};

Semafor.prototype.handleEvent = function(e) {
	if (e.type == "change") {
		if (e.target.matches('.nullable')) {
			const fieldset = e.target.nextElementSibling;
			if (!fieldset) return;
			fieldset.disabled = !e.target.checked;
		}
	}
};

types.hidden = function(key, schema, node, inst) {
	node.appendChild(node.dom(`<input name="${key}" type="hidden" />`));
};

types.string = function(key, schema, node, inst) {
	const multiline = !schema.pattern && !schema.format;
	const short = schema.maxLength != null && schema.maxLength <= 10;
	if (multiline && !short) {
		node.appendChild(node.dom(`<div class="field">
			<label>${schema.title || key}</label>
			<textarea name="${key}"	title="${schema.description || ''}" placeholder="${schema.placeholder || schema.default || ''}"></textarea>
		</div>`));
	} else if (short) {
		node.appendChild(node.dom(`<div class="inline fields">
			<label>${schema.title || key}</label>
			<div class="field">
				<input type="text" name="${key}"
					placeholder="${schema.placeholder || schema.default || ''}"
					title="${schema.description || ''}"
				/>
			</div>
		</div>`));
	} else {
		const input = node.appendChild(node.dom(`<div class="field">
			<label>${schema.title || key}</label>
			<input type="text" name="${key}"
				placeholder="${schema.placeholder || schema.default || ''}"
				title="${schema.description || ''}"
			/>
		</div>`)).lastElementChild;
		if (schema.format == "date") {
			input.type = "date";
		} else if (schema.format == "time") {
			input.type = "time";
		} else if (schema.format == "date-time") {
			input.type = "datetime-local";
		}
	}
};

types.oneOf = function(key, schema, node, inst) {
	let listOf = schema.oneOf || schema.anyOf;
	let nullable = schema.nullable;
	let hasNullOption = false;
	const alts = listOf.filter(function(item) {
		if (item.type == "null") {
			nullable = true;
			hasNullOption = true;
			return false;
		} else {
			return true;
		}
	});
	let oneOfType;
	let icons = false;
	if (alts.length == 1 && alts[0].const === undefined) {
		oneOfType = alts[0];
	} else if (alts.every(function(item) {
		return !!item.icon;
	})) {
		icons = true;
	} else if (alts.every(function(item) {
		return item.const !== undefined;
	})) {
		// do nothing
	} else if (alts.every(function(item) {
		return item == "string" || item.type === undefined || item.type == "string";
	})) {
		oneOfType = {type: "string", format: 'singleline'}; // FIXME use an array of formats
	}
	if (oneOfType) {
		inst.process(key, Object.assign(
			{}, schema, { oneOf: null, anyOf: null }, oneOfType
		), node, parent);
		return true;
	}

	let def = schema.default;
	if (def === null) def = "";

	if (nullable && !hasNullOption) {
		listOf = listOf.slice();
		if (icons) {
			listOf.splice(0, 0, {
				type: "null",
				icon: '<i class="close icon"></i>',
				title: 'None'
			});
		} else {
			listOf.splice(0, 0, {
				type: "null",
				title: 'None'
			});
		}
	}

	if (icons) {
		const field = node.dom(`<div class="inline fields">
			<label for="${key}">${schema.title || key}</label>
			<div class="ui compact icon menu">
				${alts.map(item => getIconOption(item, key)).join('\n')}
			</div>
		</div>`);
		node.appendChild(field);
		$(field).find('.radio.checkbox').checkbox();
	} else if (listOf.length <= 4) {
		const field = node.dom(`<div class="inline fields">
			<label for="${key}">${schema.title || key}</label>
			<div class="${listOf.length <= 2 ? 'inline' : ''} field">
				${listOf.map(item => getRadioOption(item, key)).join('\n')}
			</div>
		</div>`);
		node.appendChild(field);
		if (def !== undefined) {
			$(field).find(`[name="${key}"][value="${def}"]`).prop('checked', true);
		}
		$(field).find('.toggle.checkbox').checkbox();
	} else {
		const field = node.dom(`<div class="inline fields" title="${schema.description || ''}">
			<label>${schema.title || key}</label>
			<select name="${key}" class="ui compact dropdown">
				${listOf.map(item => getSelectOption(item, key)).join('\n')}
			</select>
		</div>`);
		node.appendChild(field);
		if (def !== undefined) {
			$(field).find(`[value="${def}"]`).prop('selected', true);
		}
		$(field).find('.dropdown').dropdown({placeholder: false});
	}
};

types.integer = function(key, schema, node, inst) {
	schema = Object.assign({}, schema);
	if (!schema.multipleOf) schema.multipleOf = 1;
	types.number(key, schema, node, inst);
	inst.fields[key].type = 'integer';
};

types.number = function(key, schema, node, inst) {
	node.appendChild(node.dom(`<div class="inline fields">
		<label>${schema.title || key}</label>
		<div class="field"><input type="number" name="${key}"
			placeholder="${schema.default !== undefined ? schema.default : ''}"
			title="${schema.description || ''}"
			min="${schema.minimum != null ? schema.minimum : ''}"
			max="${schema.maximum != null ? schema.maximum : ''}"
			step="${schema.multipleOf != null ? schema.multipleOf : ''}"
		/></div>
	</div>`));

	inst.fields[key].type = 'number';
};

types.object = function(key, schema, node, inst) {
	let fieldset = node;
	if (schema.title) {
		if (schema.properties && key && schema.title) {
			if (schema.nullable) {
				fieldset = node.dom(`<div class="nullable fieldset">
					<input type="checkbox" class="ui nullable checkbox">
					<fieldset name="${key}" class="field" disabled>
						<legend>${schema.title}</legend>
					</fieldset>
				</div>`);
				node.appendChild(fieldset);
				fieldset = fieldset.lastElementChild;
				fieldset.previousElementSibling.addEventListener('change', inst);
			} else {
				fieldset = node.dom(`<fieldset name="${key}" class="field">
					<legend>${schema.title}</legend>
				</fieldset>`);
				node.appendChild(fieldset);
			}

			if (schema.description) {
				fieldset.appendChild(node.dom(`<label>${schema.description}</label>`));
			}
		} else if (key) {
			fieldset = node.dom(`<div class="field"></div>`);
			node.appendChild(fieldset);
			fieldset.appendChild(node.dom(`
				<label>${schema.title || key}</label>
				<input-map name="${key}"><label>${schema.description || ''}</label></input-map>
			`));
		}
	}
	if (!schema.properties) return;
	const props = {};
	const prefix = key ? (key + '.') : '';
	Object.keys(schema.properties).forEach(function(name) {
		const propSchema = schema.properties[name];
		props[name] = inst.process(prefix + name, propSchema, fieldset, schema.properties) || propSchema;
	});
	schema.properties = props;
};

types.boolean = function(key, schema, node, inst) {
	const field = node.dom(`<div class="inline fields">
		<label>${schema.title || key}</label>
		<div class="field">
			<div class="ui toggle checkbox" title="${schema.description || ''}">
				<input type="checkbox" name="${key}" class="hidden" value="true" />
			</div>
		</div>
	</div>`);
	node.appendChild(field);
	$(field).find('.checkbox').checkbox(schema.default ? 'check' : 'uncheck');
};

types.null = function(key, schema, node, inst) {
	// a lone type null means just ignore this
};

types.array = function(key, schema, node, inst) {
	if (Array.isArray(schema.items)) {
		const fieldset = node.dom(`<fieldset><legend>${schema.title}</legend></fieldset>`);
		node.appendChild(fieldset);
		schema.items.forEach(function(item, i) {
			inst.process(`${key}.${i}`, item, fieldset, schema);
		});
	} else if (schema.items.type == "string") {
		types.string(key, schema, node, inst);
	} else if (schema.items.anyOf) {
		const allStrings = schema.items.anyOf.every(function(item) {
			return item.type == "string";
		});
		if (allStrings) {
			types.string(key, schema, node, inst);
		} else {
			const field = node.dom(`<div class="field" title="${schema.description || ''}">
				<label>${schema.title || key}</label>
				<select name="${key}" class="ui dropdown" multiple>
					${schema.items.anyOf.map(item => getSelectOption(item, key)).join('\n')}
				</select>
			</div>`);
			node.appendChild(field);
			// if (def !== undefined) {
			// 	$(field).find(`[value="${def}"]`).prop('selected', true);
			// }
			$(field).find('.dropdown').dropdown({placeholder: false});
		}
	} else {
		console.info("FIXME: array type supports only items: [schemas], or items.anyOf", schema);
		return inst.process(key, Object.assign({}, schema.items, {title: schema.title}), node, schema);
	}
};

types.const = function(key, schema, node, inst) {
	schema = Object.assign({}, schema);
	schema.pattern = new RegExp(schema.const);
	schema.placeholder = schema.const;
	if (schema.title) schema.title = `> ${schema.title}`;
	types.string(key, schema, node, inst);
	const last = node.lastElementChild;
	const input = last.querySelector('input');
	if (!schema.title) last.classList.add('hidden');
	else input.hidden = true;
	input.setAttribute('value', schema.const);
};

formats.email = function() {
	return {
		type: 'email'
	};
};

formats.uri = function() {
	return {
		type: 'url'
	};
};

formats['uri-reference'] = function() {
	return {
		type: 'url'
	};
};

formats.pathname = function() {
	return {
		type: 'regExp',
		value: /^(\/[\w-.]*)+$/
	};
};

formats.singleline = function() {
	return {
		type: 'regExp',
		value: /^[^\n\r]*$/
	};
};

formats.id = function() {
	return {
		type: 'regExp',
		value: /^[\w-]+$/
	};
};

keywords.pattern = function(value) {
	return {
		type: 'regExp',
		value: new RegExp(value)
	};
};

function getIconOption(item, key) {
	return `<div class="ui radio checkbox item" title="${item.title}">
		<input type="radio" name="${key}" value="${getValStr(item)}" tabindex="0" class="hidden">
		<label>${item.icon}</label>
	</div>`;
}

function getRadioOption(item, key) {
	return `<div class="ui toggle checkbox">
			<input type="radio" name="${key}" value="${getValStr(item)}" tabindex="0" class="hidden">
			<label>${item.title}</label>
		</div>`;
}

function getSelectOption(item) {
	return `<option value="${getValStr(item)}">${item.title || item.const}</option>`;
}

function getValStr(item) {
	if (item.const === undefined && item.type != "null") {
		console.error("non-const/non-null oneOf/anyOf");
	}
	return item.const != null ? item.const : '';
}

Semafor.findPath = function(obj, path) {
	const list = path.split('.');
	let cur = obj;
	while (cur != null && typeof cur == "object" && list.length) {
		cur = cur[list.shift()];
	}
	return cur;
};

})();
