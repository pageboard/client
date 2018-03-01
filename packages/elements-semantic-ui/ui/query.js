Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
		node.refresh(state.query);
	});
});

(function(Pageboard) {
var Pb = Pageboard.bindings;
Pb.default = {
	title: 'Default',
	merge: function(template, dom, answer, filter) {
		var list = answer.data || [];
		if (!Array.isArray(list)) list = [list];
		var ms = new MergeString(template.innerHTML);
		list.forEach(function(item) {
			var parent = dom.cloneNode(false);
			parent.innerHTML = ms.merge(item, function(fun, data) {
				if (fun.mod) {
					var mod = Pb.default.filters[fun.mod]
					if (mod) {
						var schema = (answer.schemas || {})[data.type];
						return mod(fun, data, schema);
					}
				}
			});
			if (filter) filter(item, parent);
			var child, val;
			while (child = parent.querySelector('[attr-href]')) {
				val = child.getAttribute('attr-href');
				if (val.startsWith('?')) {
					val = child.getAttribute('href') + val;
				}
				child.setAttribute('href', val);
				child.removeAttribute('attr-href');
			}
			while (parent.firstChild) dom.appendChild(parent.firstChild);
		});
		if (list.length == 0) return false; // display warning message
	},
	filters: {
		title: function(fun, data, schema) {
			var pathProp = 'properties.' + fun.path.split('.').join('.properties.');
			var prop = MergeString.get(pathProp, schema);
			if (!prop) {
				console.warn("No matching schema for title of", fun.path);
				return;
			}
			var cval = MergeString.get(fun.path, data);
			var val = prop.oneOf.find(function(item) {
				return item.const == cval;
			});
			if (val != null) return val.title;
			else return cval;
		},
		text: function(fun, data, schema) {
			var str = MergeString.get(fun.path, data);
			return str.split("\n").join('<br>');
		},
		join: function(fun, data, schema) {
			var val = MergeString.get(fun.path, data);
			if (Array.isArray(val)) return val.join('<br>');
			else return val;
		},
		date: function(fun, data, schema) {
			var val = MergeString.get(fun.path, data);
			return new Date(val).toLocaleString();
		}
	}
};
Pageboard.MergeString = MergeString;

Pb.defaultTable = {
	title: 'Default table',
	merge: function(template, dom, answer) {
		var table = template.querySelector('table').cloneNode(true);
		var body = table.querySelector('tbody');
		var template = body.cloneNode(true);
		body.textContent = "";
		if (Pb.default.merge(template, body, answer) === false) {
			return false;
		} else {
			dom.appendChild(table);
		}
	}
};

function MergeString(str) {
	var funs = this.funs = [];
	var re = /\[([^\[\]<>]+)\]/g;
	var hit, obj, index = 0, fun, expr;
	while ((hit = re.exec(str)) != null) {
		funs.push({str: str.substring(index, hit.index)});
		index = hit.index + hit[0].length;
		expr = hit[1].split('|');
		fun = {
			path: expr[0],
			mod: expr[1]
		};
		funs.push(fun);
		re.lastIndex = index;
	}
	funs.push({str: str.substring(index)});
}

MergeString.prototype.merge = function(data, filter) {
	return this.funs.map(function(fun) {
		if (fun.str != null) return fun.str;
		var str;
		if (filter) {
			str = filter(fun, data);
		}
		if (str === undefined) str = MergeString.get(fun.path, data);
		if (!str) str = "";
		return str;
	}).join('');
};

MergeString.get = function(path, data) {
	var list = path.split('.');
	var val = data;
	for (var i=0; i < list.length; i++) {
		val = val[list[i]];
		if (val == null) break;
	}
	return val;
};
})(window.Pageboard);

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
		this._refreshing = true;

		var results = this.querySelector('.results');

		if (query._id) console.warn("query._id is reserved");
		var vars = {};
		var missing = 0;
		if (this.dataset.type) {
			var form = document.querySelector(`form[data-type="${this.dataset.type}"]`);
			if (form) Array.prototype.forEach.call(form.elements, function(node) {
				var key = node.name;
				if (!key) return;
				if (query[key] !== undefined) {
					vars[key] = query[key];
				} else if (node.required) {
					missing++;
				}
			});
		}
		if (this.dataset.vars) {
			this.dataset.vars.split(',').forEach(function(key) {
				if (query[key] !== undefined) {
					vars[key] = query[key];
				} else {
					var node = document.querySelector(`form [name="${key}"]`);
					if (node && node.required) missing++;
				}
			});
		}
		if (missing > 0) return;
		vars._id = this.getAttribute('block-id');

		results.textContent = "";
		var template = this.querySelector('[block-content="template"]').cloneNode(true);
		template.removeAttribute('block-content');
		Array.from(template.querySelectorAll('[block-id]')).forEach(function(node) {
			node.removeAttribute('block-id');
		});
		var form = this;
		form.classList.remove('success', 'error', 'warning', 'loading');
		form.classList.add('loading');
		return fetch(Page.format({
			pathname: '/.api/query',
			query: vars
		})).then(function(response) {
			if (response.status >= 400) throw new Error(response.statusText);
			return response.json();
		}).then(function(answer) {
			var bindName = this.dataset.binding || "default";
			var binding = Pageboard.bindings[bindName];
			if (!binding) throw new Error("Cannot find data binder " + bindName);
			if (!binding.merge) throw new Error("Data binder need merge function " + bindName);
			if (binding.merge(template, results, answer) === false) {
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

HTMLCustomElement.define('element-query-tags', HTMLElementQueryTags);

Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query-tags')).forEach(function(node) {
		node.refresh(state.query);
	});
});

