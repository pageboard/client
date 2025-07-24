Pageboard.schemaFilters.discriminator = class {
	constructor(key, opts, prop, parent) {
		this.key = key;
		this.prop = prop;
		this.parent = parent;
	}
	update(block, prop, semafor) {
		const disc = prop.discriminator.propertyName;
		if (!disc) return;
		const copy = Object.assign({}, prop);
		delete copy.discriminator;
		delete copy.oneOf;

		const val = block.data[this.key]?.[disc];
		const sub = val !== undefined ? prop.oneOf.find(item => {
			item = semafor.resolveRef(item);
			return item.properties[disc]?.const == val;
		}) : null;
		const props = (sub ?? semafor.resolveRef(prop.oneOf[0]))?.properties;
		copy.type = 'object';
		copy.properties = { ...sub?.properties,
			[disc]: {
				title: props[disc].title,
				oneOf: prop.oneOf.map(item => {
					item = semafor.resolveRef(item);
					return { ...item.properties[disc], title: item.title };
				})
			}
		};
		return copy;
	}
};
