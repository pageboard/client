window.HTMLElementQuery = class HTMLElementQuery extends HTMLCustomElement {
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
	init() {
		this.patch = this.patch.bind(this);
	}
	connectedCallback() {
		Page.patch(this.patch);
	}
	disconnectedCallback() {
		Page.unpatch(this.patch);
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) this.update();
	}
	update() {
		return Page.patch(this.patch);
	}
	patch(state) {
		if (this.closest('[block-content="template"]')) return;
		if (!this.children.length) return;
		var query = state.query;
		if (this._refreshing) return;

		var results = this.querySelector('.results');

		if (query._id) console.warn("query._id is reserved");
		var vars = {};
		var missing = 0;
		var candidate = 0;
		if (this.dataset.type) {
			var form = document.querySelector(`body > *:not(.transition-from) form[data-type="${this.dataset.type}"]`);
			if (form && form.closest('[block-type="query"],[block-type="mail_query"]') != this) {
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
				var wasUndefined = false;
				var val = matchdom(`[$query.${key}|isUndefined]`, {$query: query}, Object.assign({
					isUndefined: function(val) {
						if (val === undefined) wasUndefined = true;
					}
				}, HTMLElementQuery.filters));
				var name = key.split('|').shift();
				if (!wasUndefined) {
					candidate++;
					vars[name] = val;
				} else {
					var node = document.querySelector(`form [name="${name}"]`);
					if (node && node.required) missing++;
				}
			});
			if (candidate == 0) return;
		}
		var me = this;
		if (missing > 0) {
			me.classList.add('error');
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
			}, HTMLElementQuery.filters);
			while (template.firstChild) results.appendChild(template.firstChild);
			this._refreshing = false;
			return;
		}
		me.classList.remove('success', 'error', 'warning', 'loading');
		me.classList.add('loading');
		return Pageboard.fetch('get', '/.api/query', vars).then(function(answer) {
			answer.$query = vars;
			matchdom(template, answer, HTMLElementQuery.filters, answer);
			while (template.firstChild) results.appendChild(template.firstChild);
			if (!answer.data || answer.data.length === 0) {
				me.classList.add('warning');
			} else {
				me.classList.add('success');
			}
		}.bind(this)).catch(function(err) {
			console.error(err);
			me.classList.add('error');
		}).then(function() {
			me.classList.remove('loading');
			this._refreshing = false;
		}.bind(this));
	}
}

HTMLElementQuery.filters = {};
HTMLElementQuery.filters.schema = function(val, what, spath) {
	// return schema of repeated key, schema of anyOf/listOf const value
	if (val === undefined) return;
	var schemaPath, schemaRoot;
	var path = what.scope.path;
	var rel = path.map(function(item) {
		if (typeof item == "number") return "items";
		else return item;
	});
	if (!what.scope.schemas) {
		console.warn("No schemas");
		return val;
	}

	var data = what.index != null ? what.scope.data : what.data.data;
	var blocks = [];
	for (var i=0; i < path.length; i++) {
		if (!data) break;
		if (data.id && data.type) blocks.push({index: i, block: data});
		data = data[path[i]];
	}
	var item = blocks.pop();
	if (!item) {
		console.warn("No block found in", what.scope.path);
		return;
	}
	schemaPath = 'schemas.' + item.block.type + '.properties.'
			+ rel.slice(item.index).join('.properties.');
	schemaRoot = what.scope;

	var schema = what.expr.get(schemaRoot, schemaPath);
	if (!schema) {
		console.warn("No schema for", schemaPath);
		return;
	}
	if ((what.scope.iskey === undefined || what.scope.iskey === false) && val !== undefined) {
		var listOf = schema.oneOf || schema.anyOf;
		if (listOf) {
			var prop = listOf.find(function(item) {
				return item.const === val; // null !== undefined
			});
			if (prop != null) schema = prop;
		} else {
			// pointless to return a schema piece when dealing with a value
			spath = null;
		}
	}
	if (spath == null) return val;
	var sval = what.expr.get(schema, spath);
	if (sval === undefined) {
		console.warn("Cannot find path in schema", schema, spath);
		sval = null;
	}
	return sval;
};

HTMLElementQuery.filters.title = function(val, what) {
	return HTMLElementQuery.filters.schema(val, what, "title");
};
HTMLElementQuery.filters.checked = function(val, what, selector) {
	var ret = what.filters.attr(val === true ? 'checked' : null, what, 'checked', selector);
	if (val !== true) delete what.attr;
	return ret;
};
HTMLElementQuery.filters.sum = function(obj, what, ...list) {
	var sum = 0;
	if (obj == null) return sum;
	list.forEach(function(str) {
		var sign = 1;
		if (str.startsWith('-')) {
			sign = -1;
			str = str.substring(1);
		}
		var curVal = what.expr.get(obj, str);
		if (curVal != null && typeof curVal == "number") sum += sign * curVal;
	});
	return sum;
};
HTMLElementQuery.filters.query = function(val, what, name) {
	var q = Object.assign({}, what.data.$query);
	for (var key in q) if (key[0] == "_") delete q[key];
	q[name] = val;
	return Page.format({pathname: "", query: q});
};

Page.init(function(state) {
	HTMLCustomElement.define('element-query', HTMLElementQuery);
});

