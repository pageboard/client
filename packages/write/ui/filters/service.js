Pageboard.schemaFilters.service = class ServiceFilter {
	static setServiceParameters(key, block, props) {
		let val = block.data;
		if (key) key.split('.').some(str => {
			val = val[str];
			if (val == null) return true;
		});
		const method = (val ?? {}).method;
		const service = Pageboard.schemas.services.definitions[method] ?? {};
		props.method ??= { ...Pageboard.schemas.services.properties.method };
		props.method.oneOf = this.list;
		if (!service.properties && !service.$ref) {
			delete props.parameters;
		} else {
			props.parameters = { ...service, type: 'object'};
		}
		if (props.auto) {
			// FIXME this has nothing to do here
			props.auto.$disabled = service.$action != "read" || service.method != "search";
		}
	}
	constructor(key, opts, schema) {
		const list = [];
		this.key = key;
		for (const [method, service] of Object.entries(Pageboard.schemas.services.definitions)) {
			if (opts.action == service.$action) {
				list.push({
					const: method,
					title: service.title
				});
			}
		}
		this.list = list.sort((a, b) => a.const - b.const);
	}
	update(block, schema) {
		schema = { ...schema };
		const props = schema.properties = { ...schema.properties };
		ServiceFilter.setServiceParameters(this.key, block, props);
		return schema;
	}
};
Pageboard.schemaHelpers.service = class ServiceHelper {
	constructor(node, opts) {
		this.key = node.getAttribute('name');
	}

	update(block, schema) {
		schema = { ...schema };
		const props = schema.properties = { ...schema.properties };
		Pageboard.schemaFilters.service.setServiceParameters(this.key, block, props);
		return schema;
	}
};
