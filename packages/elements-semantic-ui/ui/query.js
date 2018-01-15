Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
		node.refresh(state.query);
	});
});

class HTMLElementQuery extends HTMLCustomElement {
	connectedCallback() {
		if (this.children.length) this.refresh();
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) this.refresh();
	}
	update() {
		return this.refresh();
	}
	refresh(query) {
		if (!query) {
			if (!Page.state) return;
			query = Page.state.query;
		}
		query = Object.assign({}, query);
		if (query._parent) console.warn("query._parent is reserved");
		query._parent = this.getAttribute('block-id');
		var me = this;
		var type = this.dataset.type;
		var results = this.querySelector('[block-content="results"]');
		var form = this;
		form.classList.remove('success', 'error', 'info', 'loading');
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

