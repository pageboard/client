/* global $ */
(function() {

// References
// https://github.com/json-schema-org/json-schema-spec/issues/67

// addons for semantic ui
// slider
// https://github.com/tyleryasaka/semantic-ui-range

// html5 validation
// https://css-tricks.com/form-validation-part-1-constraint-validation-html/
// https://github.com/cferdinandi/validate

window.Semafor = Semafor;

function Semafor(schema, node, filter, helper) {
	this.filter = filter;
	this.helper = helper;
	// a json schema
	this.schema = schema;
	// a jquery node selector
	this.$node = $(node);
	this.node = node;
	this.fields = {};
}

function formGet(form) {
	var query = {};
	var old, key, val, elem;
	for (var i = 0; i < form.elements.length; i++) {
		elem = form.elements[i];
		key = elem.name;
		if (!key) continue;
		old = query[key];
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
			// TODO
			console.warn("not supported yet");
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

function formSet(form, values) {
	function asPaths(obj, ret, pre) {
		if (!ret) ret = {};
		Object.keys(obj).forEach(function(key) {
			var val = obj[key];
			var cur = `${pre || ""}${key}`;
			if (val == null || Array.isArray(val) || typeof val != "object") {
				ret[cur] = val;
			} else if (typeof val == "object") {
				asPaths(val, ret, cur + '.');
			}
		});
		return ret;
	}
	var elem = null, val;
	var flats = asPaths(values, {});

	for (var i = 0; i < form.elements.length; i++) {
		elem = form.elements[i];
		if (!elem.name) continue;
		val = flats[elem.name];
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
				var dropdown = elem.closest('.dropdown');
				if (dropdown) $(dropdown).dropdown({placeholder: false});
			}
			break;
		case 'select-multiple':
			console.warn("not supported yet");
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
	this.$node.form('destroy');
	this.fields = {};
	this.node.textContent = '';
};

Semafor.prototype.update = function() {
	this.destroy();
	this.process(null, this.schema, this.node);

	this.$node.form({
		on: 'blur',
		fields: this.fields,
		keyboardShortcuts: false
	});
};

Semafor.prototype.get = function() {
	var vals = formGet(this.$node[0]);
	var formVals = this.unflatten(vals);
	return this.convert(formVals);
};

Semafor.prototype.set = function(obj) {
	var vals = this.flatten(obj, {}, this.schema);
	formSet(this.$node[0], vals);
};

Semafor.prototype.clear = function() {
	this.$node[0].reset();
};

var types = Semafor.types = {
	// json schema does not allow custom types - do not modify
};

var formats = Semafor.formats = {
	// json schema allows custom formats
};

var keywords = Semafor.keywords = {
	// json schema allows custom keywords
};

Semafor.prototype.unflatten = function(map, obj) {
	if (!obj) obj = {};
	Object.keys(map).forEach(function(key) {
		var list = key.split('.');
		var val = obj;
		list.forEach(function(sub, i) {
			if (!val[sub]) {
				if (i < list.length - 1) val[sub] = {};
				else val[sub] = map[key];
			}
			val = val[sub];
		});
	});
	return obj;
};

Semafor.prototype.flatten = function(tree, obj, schema) {
	if (!obj) obj = {};
	var props = schema && schema.properties;
	Object.keys(tree).forEach(function(key) {
		var val = tree[key];
		var field = props && props[key];
		if (val != null && typeof val == "object") {
			if (field && !field.properties && (field.oneOf || field.anyOf)) {
				var listNoNull = (field.oneOf || field.anyOf).filter(function(item) {
					return item.type != "null";
				});
				if (listNoNull.length == 1 && listNoNull[0].properties) {
					field = listNoNull[0];
				}
			}
			if (!field || !field.properties) {
				obj[key] = JSON.stringify(val);
			} else {
				var sub = this.flatten(val, {}, field);
				for (var k in sub) obj[key + '.' + k] = sub[k];
			}
		} else {
			obj[key] = val;
		}
	}, this);
	return obj;
};

Semafor.prototype.convert = function(vals, field) {
	var obj = {};
	var val;
	var schema = (field || this.schema).properties;
	for (var name in vals) {
		field = schema[name];
		val = vals[name];
		if (field) {
			var type = field.type;
			var listOf = Array.isArray(type) && type
				|| Array.isArray(field.oneOf) && field.oneOf
				|| Array.isArray(field.anyOf) && field.anyOf
				|| null;
			var nullable = false;
			if (listOf && !field.properties) {
				// we support promotion to null and that's it
				var listOfNo = listOf.filter(function(item) {
					return item.type != "null";
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
				if (isNaN(val) && nullable) val = null;
				break;
			case "number":
				val = parseFloat(val);
				if (isNaN(val) && nullable) val = null;
				break;
			case "boolean":
				if (val === "" && nullable) val = null; // not really useful
				val = val == "true";
				break;
			case "object":
				if (!field.properties && (field.oneOf || field.anyOf)) {
					var listNoNull = (field.oneOf || field.anyOf).filter(function(item) {
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
Semafor.prototype.process = function(key, schema, node) {
	var type = getNonNullType(schema.type);
	if (this.filter && schema.$filter) this.filter(key, schema);
	var processed = false;
	// TODO support array of types (user selects the type he needs)
	if (type && types[type]) {
		if (type == 'object') {
			if (types[type](key, schema, node, this)) processed = true;
		} else if (!schema.title) {
			processed = true;
		} else if (!key) {
			console.error('Properties of type', type, 'must have a name');
		} else {
			var field = this.fields[key] = {};
			field.identifier = key; // TODO check if really needed
			field.rules = [];
			if (schema.format && formats[schema.format]) {
				field.rules.push(formats[schema.format](schema));
			}
			if (schema.required && schema.required.indexOf(key) >= 0) { // TODO problem key != name if nested
				field.rules.push({type: 'empty'});
			}
			Object.keys(schema).forEach(function(kw) {
				if ([
					"type",
					"required",
					"format",
					"title",
					"description",
					"id",
					"default"
				].indexOf(kw) >= 0) return;
				if (keywords[kw]) field.rules.push(keywords[kw](schema[kw]));
			});
			if (types[type](key, schema, node, this)) processed = true;
		}
	} else if (!type && (schema.oneOf || schema.anyOf)) {
		if (types.oneOf(key, schema, node, this)) processed = true;
	} else if (Array.isArray(type)) {
		type.forEach(function(type) {
			if (types[type](key, schema, node, this)) processed = true;
		});
	} else {
		console.warn(key, 'has no supported type in schema', schema);
	}
	if (key && this.helper && !processed) {
		if (!schema.title) console.warn("schema has $helper but no title", key, schema);
		else this.helper(key, schema, node);
	}
};

types.string = function(key, schema, node, inst) {
	if (!schema.pattern && !schema.format) {
		node.appendChild(node.dom(`<div class="field">
			<label>${schema.title || key}</label>
			<textarea name="${key}"	title="${schema.description || ''}">${schema.default || ''}</textarea>
		</div>`));
	} else {
		node.appendChild(node.dom(`<div class="field">
			<label>${schema.title || key}</label>
			<input type="text" name="${key}"
				value="${schema.default || ''}"
				title="${schema.description || ''}"
			/>
		</div>`));
	}
};

types.oneOf = function(key, schema, node, inst) {
	var field;
	var listOf = schema.oneOf || schema.anyOf;
	var alts = listOf.filter(function(item) {
		return item.type != "null";
	});
	var oneOfType;
	var icons = false;
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
		inst.process(key, Object.assign({}, schema, oneOfType), node);
		return true;
	}

	var def = schema.default;
	if (def === null) def = "";

	if (icons) {
		field = node.dom(`<div class="inline fields">
			<label for="${key}">${schema.title || key}</label>
			<div class="ui compact icon menu">
				${alts.map(getIconOption).join('\n')}
			</div>
		</div>`);
		node.appendChild(field);
		$(field).find('.radio.checkbox').checkbox();
	} else if (listOf.length <= 3) {
		field = node.dom(`<div class="inline fields">
			<label for="${key}">${schema.title || key}</label>
			<div class="field">
				${listOf.map(getRadioOption).join('\n')}
			</div>
		</div>`);
		node.appendChild(field);
		if (def !== undefined) {
			$(field).find(`[name="${key}"][value="${def}"]`).prop('checked', true);
		}
		$(field).find('.radio.checkbox').checkbox();
	} else {
		field = node.dom(`<div class="flex field" title="${schema.description || ''}">
			<label>${schema.title || key}</label>
			<select name="${key}" class="ui compact dropdown">
				${listOf.map(getSelectOption).join('\n')}
			</select>
		</div>`);
		node.appendChild(field);
		if (def !== undefined) {
			$(field).find(`[value="${def}"]`).prop('selected', true);
		}
		$(field).find('.dropdown').dropdown({placeholder: false});
	}

	function getIconOption(item) {
		return `<div class="ui radio checkbox item" title="${item.title}">
			<input type="radio" name="${key}" value="${getValStr(item)}" tabindex="0" class="hidden">
			<label>${item.icon}</label>
		</div>`;
	}

	function getRadioOption(item) {
		return `<div class="ui radio checkbox">
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
			value="${schema.default !== undefined ? schema.default : ''}"
			title="${schema.description || ''}"
			min="${schema.minimum != null ? schema.minimum : ''}"
			max="${schema.maximum != null ? schema.maximum : ''}"
			step="${schema.multipleOf != null ? schema.multipleOf : ''}"
		/></div>
	</div>`));

	inst.fields[key].type = 'number';
};

types.object = function(key, schema, node, inst) {
	var fieldset = node;
	if (schema.title) {
		if (schema.properties && key && schema.title) {
			fieldset = node.dom(`<fieldset name="${key}"><legend>${schema.title}</legend></fieldset>`);
			node.appendChild(fieldset);
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
	if (schema.properties) Object.keys(schema.properties).forEach(function(name) {
		var propSchema = schema.properties[name];
		if (key) name = key + '.' + name;
		inst.process(name, propSchema, fieldset);
	});
};

types.boolean = function(key, schema, node, inst) {
	var field = node.dom(`<div class="inline fields">
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
	console.info("FIXME: array implements only selection of single value");
	inst.process(key, Object.assign({}, schema.items, {title: schema.title}), node);
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

})();
