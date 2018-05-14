Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
		node.refresh(state.query);
	});
});

class HTMLElementQuery extends HTMLCustomElement {
	static find(name, value) {
		// convert query into a query that contains only
		var nodes = document.querySelectorAll(`form [name="${name}"]`);
		return Array.prototype.filter.call(nodes, function(node) {
			if (Array.isArray(value)) {
				if (value.indexOf(node.value) < 0) return;
			} else {
				if (value != node.value) return;
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
		this.refresh();
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) this.refresh();
	}
	update() {
		return this.refresh();
	}
	refresh(query) {
		if (!this.children.length) return;
		if (!query) {
			if (!Page.state) return;
			query = Page.state.query;
		}
		if (this._refreshing) return;

		var results = this.querySelector('.results');

		if (query._id) console.warn("query._id is reserved");
		var vars = {};
		var missing = 0;
		var candidate = 0;
		if (this.dataset.type) {
			var form = document.querySelector(`form[data-type="${this.dataset.type}"]`);
			if (form && form.closest('[block-type="query"]') != this) {
				Array.prototype.forEach.call(form.elements, function(node) {
					var key = node.name;
					if (!key) return;
					if (query[key] !== undefined) {
						vars[key] = query[key];
						candidate++;
					} else if (node.required) {
						missing++;
					}
				});
			}
		}
		if (this.dataset.vars) {
			this.dataset.vars.split(',').forEach(function(key) {
				if (query[key] !== undefined) {
					candidate++;
					vars[key] = query[key];
				} else {
					var node = document.querySelector(`form [name="${key}"]`);
					if (!node || node.required) missing++;
				}
			});
		}
		var form = this;
		if (missing > 0) {
			form.classList.add('error');
			return;
		}
		this._refreshing = true;
		vars._id = this.getAttribute('block-id');

		results.textContent = "";
		var template = this.querySelector('[block-content="template"]').cloneNode(true);
		template.removeAttribute('block-content');
		Array.from(template.querySelectorAll('[block-id]')).forEach(function(node) {
			node.removeAttribute('block-id');
		});
		if (this.dataset.nocall == "true") {
			matchdom(template, {
				$query: vars
			}, HTMLElementQuery.filters, {});
			while (template.firstChild) results.appendChild(template.firstChild);
			this._refreshing = false;
			return;
		}
		form.classList.remove('success', 'error', 'warning', 'loading');
		form.classList.add('loading');
		return Pageboard.fetch('get', '/.api/query', vars).then(function(answer) {
			answer.$query = vars;
			matchdom(template, answer, HTMLElementQuery.filters, answer.data);
			while (template.firstChild) results.appendChild(template.firstChild);
			if (!answer.data || answer.data.length === 0) {
				form.classList.add('warning');
			} else {
				form.classList.add('success');
			}
		}.bind(this)).catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
			this._refreshing = false;
		}.bind(this));
	}
}

HTMLElementQuery.filters = {};
HTMLElementQuery.filters.title = function(val, what) {
	var path = what.expr.path;
	var rootPath = path.slice(0, -2);
	var block = what.expr.get(what.scope, rootPath);
	if (!block || !block.type) {
		console.warn("No block found matching", rootPath, what);
		return;
	}
	var schemaPath = 'schemas.' + block.type + '.properties.' + path.slice(rootPath.length).join('.properties.');
	var schema = what.expr.get(what.data, schemaPath);
	if (!schema) {
		console.warn("No matching schema for title of", schemaPath, what);
		return;
	}
	var listOf = schema.oneOf || schema.anyOf;
	if (!listOf) {
		console.warn("No oneOf/anyOf schema for property of", schemaPath);
	}
	var prop = listOf.find(function(item) {
		return item.const === val; // null !== undefined
	});
	if (prop != null) return prop.title;
};

HTMLCustomElement.define('element-query', HTMLElementQuery);

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
				if (control.value == "") return;
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
			if (control.reset) control.reset();
			else if (control.value) control.value = "";
			var e = document.createEvent('HTMLEvents');
			e.initEvent('submit', true, true);
			control.form.dispatchEvent(e);
		}, this);
		label.remove();
	}
}

HTMLCustomElement.define('element-query-tags', HTMLElementQueryTags);

Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query-tags')).forEach(function(node) {
		node.refresh(state.query);
	});
});

