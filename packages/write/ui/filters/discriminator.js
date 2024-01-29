Pageboard.schemaFilters.discriminator = class {
	constructor(key, opts, prop, parent) {
		this.key = key;
		this.prop = prop;
		this.parent = parent;
	}
	update(block, prop, semafor) {
		const disc = prop.discriminator.propertyName;
		if (!disc) return;
		const val = block.data[this.key]?.[disc];
		if (val === undefined) return;
		const copy = Object.assign({}, prop);
		delete copy.discriminator;
		delete copy.oneOf;
		const sub = prop.oneOf.find(item => {
			item = semafor.resolveRef(item);
			return item.properties[disc]?.const == val;
		});
		if (!sub) {
			console.warn("discriminator not found", disc, val);
		}
		const props = sub?.properties ?? {};
		copy.type = 'object';
		copy.properties = { ...props,
			[disc]: {
				title: sub ? props[disc].title : prop.oneOf[0]?.properties[disc].title,
				oneOf: prop.oneOf.map(item => {
					item = semafor.resolveRef(item);
					return { ...item.properties[disc], title: item.title };
				})
			}
		};
		return copy;
	}
};
