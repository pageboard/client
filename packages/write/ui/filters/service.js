Pageboard.schemaFilters.service = class ServiceFilter {
	static setServiceParameters(key, block, props) {
		let val = block.data;
		if (key) key.split('.').some(str => {
			val = val[str];
			if (val == null) return true;
		});
		const method = (val ?? {}).method;
		const service = Pageboard.service(method) ?? {};
		if (!service.properties && !service.$ref) {
			delete props.parameters;
		} else {
			props.parameters = { ...service, type: 'object'};
		}
		if (props.auto) {
			props.auto.$disabled = service.$action != "read" || service.method != "search";
		}
	}
	constructor(key, opts, schema) {
		const list = [];
		this.key = key;
		for (const [group, service] of Object.entries(Pageboard.services)) {
			for (const [name, it] of Object.entries(service)) {
				if (opts.action == it.$action) {
					list.push({
						const: `${group}.${name}`,
						title: it.title
					});
				}
			}
		}
		this.list = list.sort((a, b) => a.const - b.const);
	}
	update(block, schema) {
		schema = { ...schema };
		const props = schema.properties = { ...schema.properties };
		props.method = { ...props.method, anyOf: this.list};
		delete props.method.type;
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