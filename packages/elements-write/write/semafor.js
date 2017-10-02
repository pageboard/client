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
	return this.convert(this.$node.form('get values'));
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

Semafor.prototype.convert = function(vals) {
	var obj = {};
	var field, val;
	var schema = this.schema.properties;
	for (var name in vals) {
		field = schema[name];
		val = vals[name];
		if (field) switch(field.type) {
			case "integer":
				val = parseInt(val);
			break;
			case "number":
				val = parseFloat(val);
			break;
			case "boolean":
				val = val == "true";
			break;
			case "object":
				console.error("Cannot convert object");
			break;
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
	var alts = schema.oneOf;
	var icons = alts.every(function(item) { return !!item.icon; });
	if (icons) {
		field = node.dom`<div class="ui compact icon menu">
			${alts.map(getIconOption)}
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
		field = node.dom`<div class="field" title="${schema.description || ''}">
			<label>${schema.title}</label>
			<select name="${key}" class="ui dropdown">
				${alts.map(getSelectOption)}
			</select>
		</div>`;
		node.appendChild(field);
		$(field).find('.dropdown').dropdown();
	}

	function getIconOption(item) {
		return `<div class="ui radio checkbox item" title="${item.title}">
			<input type="radio" name="${key}" value="${item.constant}" checked="" tabindex="0" class="hidden">
			<label>${item.icon}</label>
		</div>`;
	}

	function getRadioOption(item) {
		return node.dom`<div class="ui radio checkbox">
				<input type="radio" name="${key}" value="${item.constant}" checked="" tabindex="0" class="hidden">
				<label>${item.title}</label>
			</div>`;
	}

	function getSelectOption(item) {
		if (item.constant == null) console.error("We can't really support non-constant oneOf here");
		return node.dom`<option value="${item.constant}">${item.title || item.constant}</option>`;
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

types.boolean = function(key, schema, node, fields) {
	var field = node.dom`<div class="inline fields">
		<label>${schema.title}</label>
		<div class="field">
			<div class="ui toggle checkbox">
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
