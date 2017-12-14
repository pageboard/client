Page.patch(function() {
	Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
		node.refresh();
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
	refresh() {
		var me = this;
		var query = {};
		var state = Page.parse();
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
		var content = this.querySelector('[block-content="blocks"]');
		var emptyContent = this.querySelector('[block-content="empty"]');
		var errorContent = this.querySelector('[block-content="error"]');
		emptyContent.classList.add('hidden');
		errorContent.classList.add('hidden');
		content.textContent = "";
		return fetch(Page.format({
			pathname: '/.api/query',
			query: query
		})).then(function(response) {
			if (response.status >= 400) return [];
			return response.json();
		}).then(function(blocks) {
			if (blocks && Array.isArray(blocks) == false) blocks = [blocks];
			if (blocks.length == 0) emptyContent.classList.remove('hidden');
			return Promise.all(blocks.map(function(cur) {
				var el = Pageboard.elements[type];
				if (!el) throw new Error("Cannot render unknown type " + type);
				return el.render(content.ownerDocument, cur);
			})).then(function(nodes) {
				nodes.forEach(function(node) {
					content.appendChild(node);
				});
			});
		}).catch(function(err) {
			console.error(err);
			errorContent.classList.remove('hidden');
		});
	}
}

window.customElements.define('element-query', HTMLElementQuery);

