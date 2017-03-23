(function() {

// References
// https://github.com/json-schema-org/json-schema-spec/issues/67

// addons for semantic ui
// slider
// https://github.com/tyleryasaka/semantic-ui-range

window.Semafor = Semafor;

function Semafor(schema, node) {
	// a json schema
	this.schema = schema;
	// a jquery node selector
	this.node = node;
	this.$node = $(node);
	var fields = {};
	// populates node with form markup matching schema,
	// and configure fields object
	process(null, schema, EL(node), fields);

	// then initialize the form using semantic-ui form behavior
	this.$node.form({
		on: 'blur',
		fields: fields
	});
}

Semafor.prototype.get = function() {
	return this.$node.form('get values');
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

function EL(node) {
	function create(tag, attrs, text) {
		var child = node.ownerDocument.createElement(tag);
		if (typeof attrs == 'string' && text === undefined) {
			text = attrs;
			attrs = {};
		}
		for (var k in attrs) child.setAttribute(k, attrs[k]);
		if (text != null) child.textContent = text;
		return EL(child);
	}
	function append(tag, attrs, text) {
		var child;
		if (typeof tag == 'string') {
			child = create(tag, attrs, text);
		} else {
			if (!tag.node) child = EL(tag);
			else child = tag;
		}
		node.appendChild(child.node);
		return child;
	}
	return {
		append: append,
		create: create,
		node: node
	};
}

function process(key, schema, el, fields) {
	var type = schema.type;
	// TODO support array of types (user selects the type he needs)
	if (type && types[type]) {
		if (type == 'object') {
			types[type](key, schema, el, fields);
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
			types[type](key, schema, el, fields);
		}
	} else if (!type && schema.oneOf) {
		types.oneOf(key, schema, el, fields);
	} else {
		console.error('Unsupported type', type);
	}
}

types.string = function(key, schema, el, fields) {
	var field = el.append('div', {class: 'field'});
	if (schema.title) {
		field.append('label', schema.title);
	}
	var attrs = {
		type: 'text',
		name: key
	};
	if (schema.default !== undefined) attrs.value = schema.default;
	field.append('input', attrs);
};

types.oneOf = function(key, schema, el, fields) {
	var field = el.append('div', {class: 'field'});
	if (schema.title) field.append('label', schema.title);
	var select = field.append('select', {name: key});
	var item;
	for (var i=0; i < schema.oneOf.length; i++) {
		item = schema.oneOf[i];
		if (!item.constant) console.error("We can't really support non-constant oneOf here");
		select.append('option', {value: item.constant}, item.title || item.constant);
	}
};

types.integer = function(key, schema, el, fields) {
	schema = Object.assign({}, schema);
	schema.multipleOf = 1;
	types.number(key, schema, el, fields);
	fields[key].type = 'integer';
};

types.number = function(key, schema, el, fields) {
	var field = el.append('div', {class: 'inline field'});
	if (schema.title) {
		field.append('label', schema.title);
	}

	var attrs = {
		name: key,
		type: 'number'
	};
	if (schema.default !== undefined) attrs.value = schema.default;

	attrs.type = 'number';
	if (schema.description) attrs.title = schema.description;
	if (schema.minimum != null) attrs.min = schema.minimum;
	if (schema.maximum != null) attrs.max = schema.maximum;
	if (schema.multipleOf != null) attrs.step = schema.multipleOf;
	field.append('input', attrs);
	fields[key].type = 'number';
};

types.object = function(key, schema, el, fields) {
	if (schema.title) {
		el = el.append('fieldset').append('legend', schema.title);
	}

	for (var name in schema.properties) {
		var propSchema = schema.properties[name];
		if (key) name = key + '.' + name;
		process(name, propSchema, el, fields);
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
