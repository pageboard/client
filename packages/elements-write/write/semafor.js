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

function Semafor(schema, node) {
	// a json schema
	this.schema = schema;
	// a jquery node selector
	this.$node = $(node);
	this.fields = {};
	// populates node with form markup matching schema,
	// and configure fields object
	process(null, schema, node, this.fields);

	// then initialize the form using semantic-ui form behavior
	this.$node.form({
		on: 'blur',
		fields: this.fields
	});
}

Semafor.prototype.get = function() {
	var vals = this.$node.form('get values');
	var formVals = this.retree(vals);
	return this.convert(formVals);
};

Semafor.prototype.set = function(obj) {
	var vals = this.flatten(obj, {}, this.schema);
	this.$node.form('set values', vals);
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

Semafor.prototype.retree = function(map, obj) {
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
		var subSchema = props && props[key];
		if (val != null && typeof val == "object") {
			if (!subSchema || !subSchema.properties) {
				obj[key] = JSON.stringify(val);
			} else {
				var sub = this.flatten(val);
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
	var field, val;
	var schema = (field || this.schema).properties;
	for (var name in vals) {
		field = schema[name];
		val = vals[name];
		if (field) {
			var type = field.type;
			var typeList = Array.isArray(type) && type
				|| Array.isArray(field.oneOf) && field.oneOf
				|| null;
			var nullable = false;
			if (typeList) {
				// we support promotion to null and that's it
				typeList = typeList.filter(function(item) {
					if (item.type == "null") {
						nullable = true;
						return false;
					} else {
						return true;
					}
				});
				if (typeList.length == 1) type = typeList[0].type || typeList[0];
				else if (typeList.every(function(item) {
					return item.const !== undefined;
				})) {
					// do nothing
				} else if (typeList.every(function(item) {
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

function process(key, schema, node, fields) {
	var type = schema.type;
	// TODO support array of types (user selects the type he needs)
	if (type && types[type]) {
		if (type == 'object') {
			types[type](key, schema, node, fields);
		} else if (!schema.title) {
			// ignore this value
			return;
		} else if (!key) {
			console.error('Properties of type', type, 'must have a name');
		} else {
			var field = fields[key] = {};
			field.identifier = key; // TODO check if really needed
			field.rules = [];
			if (schema.format && formats[schema.format]) {
				field.rules.push(formats[schema.format](schema));
			}
			if (schema.required && schema.required.indexOf(key) >= 0) { // TODO problem key != name if nested
				field.rules.push({type: 'empty'});
			}
			for (var kw in schema) {
				if ([
					"type",
					"required",
					"format",
					"title",
					"description",
					"id",
					"default"
				].indexOf(kw) >= 0) continue;
				if (keywords[kw]) field.rules.push(keywords[kw](schema[kw]));
			}
			types[type](key, schema, node, fields);
		}
	} else if (!type && schema.oneOf) {
		types.oneOf(key, schema, node, fields);
	} else if (Array.isArray(type)) {
		type.forEach(function(type) {
			types[type](key, schema, node, fields);
		});
	} else {
		console.warn(key, 'has no supported type in schema', schema);
	}
}

types.string = function(key, schema, node, fields) {
	node.appendChild(node.dom`<div class="field">
		<label>${schema.title}</label>
		<input type="text" name="${key}"
			value="${schema.default || ''}"
			title="${schema.description || ''}"
		/>
	</div>`);
};

types.oneOf = function(key, schema, node, fields) {
	var field;
	var alts = schema.oneOf.filter(function(item) {
		return item.type != "null";
	});
	var oneOfType;
	var icons = false;
	if (alts.length == 1) {
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
		oneOfType = {type: "string"};
	}
	if (oneOfType) {
		return process(key, Object.assign({}, schema, oneOfType), node, fields);
	}

	if (icons) {
		field = node.dom`<div class="inline fields">
			<label for="${key}">${schema.title}</label>
			<div class="ui compact icon menu">
				${alts.map(getIconOption)}
			</div>
		</div>`;
		node.appendChild(field);
		$(field).find('.radio.checkbox').checkbox();
	} else if (alts.length <= 3) {
		field = node.dom`<div class="inline fields">
			<label for="${key}">${schema.title}</label>
			<div class="field">
				${alts.map(getRadioOption)}
			</div>
		</div>`;
		node.appendChild(field);
		$(field).find('.radio.checkbox').checkbox();
		if (schema.default !== null) $(field).find(`[name="${key}"][value="${schema.default}"]`).prop('checked', true);
	} else {
		field = node.dom`<div class="flex field" title="${schema.description || ''}">
			<label>${schema.title}</label>
			<select name="${key}" class="ui compact dropdown">
				${alts.map(getSelectOption)}
			</select>
		</div>`;
		node.appendChild(field);
		$(field).find('.dropdown').dropdown();
	}

	function getIconOption(item) {
		return `<div class="ui radio checkbox item" title="${item.title}">
			<input type="radio" name="${key}" value="${item.const}" tabindex="0" class="hidden">
			<label>${item.icon}</label>
		</div>`;
	}

	function getRadioOption(item) {
		return node.dom`<div class="ui radio checkbox">
				<input type="radio" name="${key}" value="${item.const}" tabindex="0" class="hidden">
				<label>${item.title}</label>
			</div>`;
	}

	function getSelectOption(item) {
		if (item.const == null) console.error("We can't really support non-const oneOf here");
		return node.dom`<option value="${item.const}">${item.title || item.const}</option>`;
	}
};

types.integer = function(key, schema, node, fields) {
	schema = Object.assign({}, schema);
	if (!schema.multipleOf) schema.multipleOf = 1;
	types.number(key, schema, node, fields);
	fields[key].type = 'integer';
};

types.number = function(key, schema, node, fields) {
	node.appendChild(node.dom`<div class="inline fields">
		<label>${schema.title || ''}</label>
		<div class="field"><input type="number" name="${key}"
			value="${schema.default !== undefined ? schema.default : ''}"
			title="${schema.description || ''}"
			min="${schema.minimum != null ? schema.minimum : ''}"
			max="${schema.maximum != null ? schema.maximum : ''}"
			step="${schema.multipleOf != null ? schema.multipleOf : ''}"
		/></div>
	</div>`);

	fields[key].type = 'number';
};

types.object = function(key, schema, node, fields) {
	var fieldset = node;
	if (schema.title) {
		if (schema.properties) {
			fieldset = node.dom`<fieldset name="${key}"><legend>${schema.title}</legend></fieldset>`;
			node.appendChild(fieldset);
			if (schema.description) {
				fieldset.appendChild(node.dom`<label>${schema.description}</label>`);
			}
		} else {
			fieldset = node.dom`<div class="field"></div>`;
			node.appendChild(fieldset);
			fieldset.appendChild(node.dom`
				<label>${schema.title}</label>
				<input-map name="${key}"><label>${schema.description}</label></input-map>
			`);
		}
	}
	if (schema.properties) for (var name in schema.properties) {
		var propSchema = schema.properties[name];
		if (key) name = key + '.' + name;
		process(name, propSchema, fieldset, fields);
	}
};

types.boolean = function(key, schema, node, fields) {
	var field = node.dom`<div class="inline fields">
		<label>${schema.title}</label>
		<div class="field">
			<div class="ui toggle checkbox" title="${schema.description || ''}">
				<input type="checkbox" name="${key}" class="hidden" value="true" />
			</div>
		</div>
	</div>`;
	node.appendChild(field);
	$(field).find('.checkbox').checkbox(schema.default ? 'check' : 'uncheck');
};

types.null = function(key, schema, node, fields) {
	// a lone type null means just ignore this
};

types.array = function(key, schema, node, fields) {

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

keywords.pattern = function(value) {
	return {
		type: 'regExp',
		value: new RegExp(value)
	};
};

})();
