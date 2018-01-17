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

class HTMLElementQueryTags extends HTMLCustomElement {
	init() {
		this.close = this.close.bind(this);
	}
	connectedCallback() {
		this.addEventListener('click', this.close);
		if (this.children.length) this.refresh();
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.close);
	}
	find(name, value) {
		var nodes = document.querySelectorAll(`form [name="${name}"]`);
		return Array.prototype.filter.call(nodes, function(control) {
			if (Array.isArray(value)) {
				if (value.indexOf(control.value) < 0) return;
			} else {
				if (value != control.value) return;
			}
			return true;
		});
	}
	refresh(query) {
		if (!query) {
			if (!Page.state) return;
			query = Page.state.query;
		}
		var labels = this.querySelector('.labels');
		if (!labels) return;
		labels.textContent = '';
		var control, field, label;
		for (var name in query) {
			this.find(name, query[name]).forEach(function(control) {
				field = control.closest('.field');
				if (!field) return;
				label = field.querySelector('label');
				if (!label) return;
				labels.insertAdjacentHTML('beforeEnd', `<a class="ui label" data-name="${name}" data-value="${control.value}">
					${label.innerText}
					<i class="delete icon"></i>
				</a>`);
			}, this);
		}
	}
	close(e) {
		var label = e.target.closest('.label');
		if (!label) return;
		this.find(label.dataset.name, label.dataset.value).forEach(function(control) {
			if (control.checked) control.checked = false;
			var e = document.createEvent('HTMLEvents');
			e.initEvent('submit', true, true);
			control.form.dispatchEvent(e);
		}, this);
		label.remove();
	}
}

window.customElements.define('element-query-tags', HTMLElementQueryTags);

Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query-tags')).forEach(function(node) {
		node.refresh(state.query);
	});
});

