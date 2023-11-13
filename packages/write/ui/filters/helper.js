Pageboard.schemaFilters.helper = class HelperFilter {
	/*
	$filter: {
		name: 'helper',
		helper: {
			name: 'xxx',
			../..
		}
	}
	will replace current helper with the one given in path
	*/
	constructor(key, opts) {
		this.opts = opts;
	}

	update(block, schema) {
		if (!this.opts.helper) {
			console.warn("$filter helper is missing helper option");
			return;
		}
		return { ...schema, $helper: this.opts.helper };
	}
};
