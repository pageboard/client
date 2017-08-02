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
	this.node = node;
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
	return convertVals(this.$node.form('get values'), this.fields);
};

Semafor.prototype.set = function(obj) {
	this.$node.form('set values', obj);
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

function convertVals(vals, fields) {
	var obj = {};
	var field, val;
	for (var name in vals) {
		field = fields[name];
		val = vals[name];
		if (field) {
			if (field.type == "integer") {
				val = parseInt(val);
			} else if (field.type == "object") {
				// TODO recursive
				console.warn("semafor unsupported type object");
			}
		}
		obj[name] = val;
	}
	return obj;
}

function process(key, schema, node, fields) {
	var type = schema.type;
	// TODO support array of types (user selects the type he needs)
	if (type && types[type]) {
		if (type == 'object') {
			types[type](key, schema, node, fields);
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
		console.error('Unsupported type', type);
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
	var field = node.dom`<div class="field" title="${schema.description || ''}">
		<label>${schema.title}</label>
		<select name="${key}" class="ui dropdown">
			${schema.oneOf.map(getSelectOption)}
		</select>
	</div>`;
	node.appendChild(field);
	$(field).find('.dropdown').dropdown();

	function getSelectOption(item) {
		if (item.constant == null) console.error("We can't really support non-constant oneOf here");
		return node.dom`<option value="${item.constant}">${item.title || item.constant}</option>`;
	}
};

types.integer = function(key, schema, node, fields) {
	schema = Object.assign({}, schema);
	schema.multipleOf = 1;
	types.number(key, schema, node, fields);
	fields[key].type = 'integer';
};

types.number = function(key, schema, node, fields) {
	node.appendChild(node.dom`<div class="inline field">
		<label>${schema.title || ''}</label>
		<input type="number" name="${key}"
			value="${schema.default !== undefined ? schema.default : ''}"
			title="${schema.description || ''}"
			min="${schema.minimum != null ? schema.minimum : ''}"
			max="${schema.maximum != null ? schema.maximum : ''}"
			step="${schema.multipleOf != null ? schema.multipleOf : ''}"
		/>
	</div>`);

	fields[key].type = 'number';
};

types.object = function(key, schema, node, fields) {
	if (schema.title) {
		node.appendChild(node.dom`<fieldset>
			<legend>${schema.title}</legend>
		</fieldset>`);
	}

	for (var name in schema.properties) {
		var propSchema = schema.properties[name];
		if (key) name = key + '.' + name;
		process(name, propSchema, node, fields);
	}
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
