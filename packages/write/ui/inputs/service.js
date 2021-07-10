(function(Pageboard) {
Pageboard.schemaFilters.service = ServiceFilter;
Pageboard.schemaHelpers.service = ServiceHelper;

function ServiceFilter(key, opts, schema) {
	const list = [];
	this.key = key;
	const services = Pageboard.services;
	Object.keys(services).forEach(function(group) {
		Object.keys(services[group]).forEach(function(key) {
			const it = services[group][key];
			if (opts.action == it.$action || opts.action == "write" && it.$action != "read") {
				list.push({
					const: `${group}.${key}`,
					title: it.title
				});
			}
		});
	});
	this.list = list.sort(function(a, b) {
		if (a.const < b.const) return -1;
		else if (a.const > b.const) return 1;
		else return 0;
	});
}

ServiceFilter.prototype.update = function(block, schema) {
	schema = Object.assign({}, schema);
	const props = schema.properties = Object.assign({}, schema.properties);
	props.method = Object.assign({}, props.method, {anyOf: this.list});
	delete props.method.type;
	setServiceParameters(this.key, block, props);
	return schema;
};


function ServiceHelper(node, opts) {
	this.key = node.getAttribute('name');
}

ServiceHelper.prototype.update = function(block, schema) {
	schema = Object.assign({}, schema);
	const props = schema.properties = Object.assign({}, schema.properties);
	setServiceParameters(this.key, block, props);
	return schema;
};

function setServiceParameters(key, block, props) {
	let val = block.data;
	if (key) key.split('.').some(function(str) {
		val = val[str];
		if (val == null) return true;
	});
	let service = {};
	const method = (val || {}).method;
	const parts = (method || "").split('.');
	if (parts.length == 2) {
		service = (Pageboard.services[parts[0]] || {})[parts[1]] || {};
	}
	if (!service.properties) {
		delete props.parameters;
	} else {
		props.parameters = Object.assign({}, service, {type: 'object'});
	}
}

})(window.Pageboard);
