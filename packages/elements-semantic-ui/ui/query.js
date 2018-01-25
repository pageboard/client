Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
		node.refresh(state.query);
	});
});

if (!window.Pageboard) window.Pageboard = {};
window.Pageboard.bindings = {};

class HTMLElementQuery extends HTMLCustomElement {
	static find(name, value) {
		// convert query into a query that contains only
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
	static filterQuery(query) {
		var obj = {};
		for (var name in query) {
			var vals = HTMLElementQuery.find(name, query[name]).map(function(node) {
				return node.value;
			});
			if (vals.length == 1) {
				obj[name] = vals[0];
			} else if (vals.length > 1) {
				obj[name] = vals;
			}
		}
		return obj;
	}
	connectedCallback() {
		if (!this.children.length) return;
		if (!this.querySelector('.results')) {
			this.insertAdjacentHTML('beforeEnd', '<div class="results"></div>');
		}
		this.refresh();
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
		if (query._parent) console.warn("query._parent is reserved");
		query = HTMLElementQuery.filterQuery(query);
		query._parent = this.getAttribute('block-id');
		var me = this;
		var results = this.querySelector('.results');
		results.textContent = "";
		var form = this;
		form.classList.remove('success', 'error', 'warning', 'loading');
		form.classList.add('loading');
		return fetch(Page.format({
			pathname: '/.api/query',
			query: query
		})).then(function(response) {
			if (response.status >= 400) throw new Error(response.statusText);
			return response.json();
		}).then(function(data) {
			var bindName = this.dataset.binding;
			var binding = Pageboard.bindings[bindName];
			if (!binding) throw new Error("Cannot find data binder " + bindName);
			if (!binding.merge) throw new Error("Data binder need merge function " + bindName);
			var template = this.querySelector('[block-content="template"]').cloneNode(true);
			Array.from(template.querySelectorAll('[block-id]')).forEach(function(node) {
				node.removeAttribute('block-id');
			});
			if (binding.merge(template, results, data) === false) {
				form.classList.add('warning');
			} else {
				form.classList.add('success');
			}
		}.bind(this)).catch(function(err) {
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
			HTMLElementQuery.find(name, query[name]).forEach(function(control) {
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
		HTMLElementQuery.find(label.dataset.name, label.dataset.value).forEach(function(control) {
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

