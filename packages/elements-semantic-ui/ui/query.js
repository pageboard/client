Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
		node.refresh(state);
	});
});

class HTMLElementQuery extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		if (this.children.length) this.refresh();
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) this.refresh();
	}
	update() {
		return this.refresh();
	}
	refresh(state) {
		var me = this;
		var query = {};
		if (!state) state = Page.parse();
		Object.keys(this.dataset).forEach(function(key) {
			if (key == "type") return;
			var val = this[key];
			if (val.startsWith('query.')) {
				var qkey = val.substring(6);
				val = state.query[qkey];
			}
			query[key] = val;
		}, this.dataset);

		query.parent = this.getAttribute('block-id');

		var savedQuery = JSON.stringify(Object.keys(query).sort().map(function(key) {
			return [key, query[key]];
		}));
		if (savedQuery == this._savedQuery) {
			return;
		}
		this._savedQuery = savedQuery;

		var type = this.dataset.type;
		var results = this.querySelector('[block-content="results"]');
		var form = this;
		form.classList.remove('success', 'error', 'warning', 'loading');
		form.classList.add('loading');
		results.textContent = "";
		return fetch(Page.format({
			pathname: '/.api/query',
			query: query
		})).then(function(response) {
			if (response.status >= 400) throw new Error(response.statusText);
			return response.json();
		}).then(function(blocks) {
			if (blocks && Array.isArray(blocks) == false) blocks = [blocks];
			if (blocks.length == 0) form.classList.add('info');
			return Promise.all(blocks.map(function(cur) {
				var el = Pageboard.elements[type];
				if (!el) throw new Error("Cannot render unknown type " + type);
				return el.render(results.ownerDocument, cur);
			})).then(function(nodes) {
				nodes.forEach(function(node) {
					results.appendChild(node);
				});
				form.classList.add('success');
			});
		}).catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
		});
	}
}

window.customElements.define('element-query', HTMLElementQuery);

