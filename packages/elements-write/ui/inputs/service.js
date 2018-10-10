(function(Pageboard) {
Pageboard.schemaFilters.service = ServiceFilter;
Pageboard.schemaHelpers.service = ServiceHelper;

function ServiceFilter(key, opts, schema) {
	var list = [];
	this.key = key;
	var services = Pageboard.services;
	Object.keys(services).forEach(function(group) {
		Object.keys(services[group]).forEach(function(key) {
			var it = services[group][key];
			if (opts.action == it.$action || opts.action == "write" && it.$action != "read") {
				list.push({
					const: `${group}.${key}`,
					title: it.title
				});
			}
		});
	});
	this.list = list.sort(function(a, b) {
		if (a.title < b.title) return -1;
		else if (a.title > b.title) return 1;
		else return 0;
	});
	this.list.unshift({
		const: '',
		title: 'None'
	});
	var props = schema.properties;
	this.schemas = {
		parent: props,
		method: Object.assign({}, props.method),
		parameters: Object.assign({}, props.parameters),
	};
}

ServiceFilter.prototype.init = function(block) {
	var props = this.schemas.parent;
	props.method.anyOf = this.list;
	delete props.method.type;
	setServiceParameters(this.key, block, props);
};

ServiceFilter.prototype.destroy = function() {
	var props = this.schemas.parent;
	props.method = this.schemas.method;
	props.parameters = this.schemas.parameters;
};


function ServiceHelper(node, opts, schema) {
	this.key = node.getAttribute('name');
	this.props = schema.properties;
}

ServiceHelper.prototype.update = function(block) {
	setServiceParameters(this.key, block, this.props);
};

ServiceHelper.prototype.destroy = function() {
};

function setServiceParameters(key, block, props) {
	var val = block.data;
	if (key) key.split('.').some(function(str) {
		val = val[str];
		if (val == null) return true;
	});
	var service = {};
	var method = (val || {}).method;
	var parts = (method || "").split('.');
	if (parts.length == 2) {
		service = Pageboard.services[parts[0]][parts[1]];
	}
	if (!service.properties) {
		delete props.parameters;
	} else {
		props.parameters = Object.assign({}, service, {type: 'object'});
	}
}

})(window.Pageboard);
