Page.build(function(state) {
class HTMLElementQuery extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.refresh();
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) this.refresh();
	}
	update() {
		return this.refresh();
	}
	refresh() {
		// TODO allow sorting, page offset as well
		var me = this;
		var d = this.dataset;
		if (!d.type) return;
		var queryIn = state.query;
		if (d.prefix) queryIn = queryIn[d.prefix];
		var queryOut = {};
		// must override queryIn keys
		queryOut.type = d.type;
		if (d.limit) queryOut.limit = d.limit;
		if (!d.keys) return;

		if (d.keys.split(' ').some(function(key) {
			if (queryIn[key] === undefined) {
				console.info("Missing query key", key);
				return true;
			}
			queryOut[key] = queryIn[key];
		})) {
			return;
		}
		if (!Object.keys(queryOut).length) return;
		var savedQuery = JSON.stringify(Object.keys(queryOut).sort().map(function(key) {
			return [key, queryOut[key]];
		}));
		if (savedQuery == this._savedQuery) {
			return;
		}
		this._savedQuery = savedQuery;

		return GET('/.api/block', queryOut).then(function(blocks) {
			return Promise.all(blocks.map(function(cur) {
				return Pageboard.view.blocks.parseFrom(cur, {}, Pageboard.view.store, d.override)
				.then(function(node) {
					var existing = me.querySelector(`[block-id="${cur.id}"]`);
					if (!existing) me.appendChild(node);
				});
			}));
		}).catch(function(err) {
			console.error(err);
		});
	}
}
window.customElements.define('element-query', HTMLElementQuery);

});

Page.patch(function() {
	// TODO call refresh of all element-query
});
