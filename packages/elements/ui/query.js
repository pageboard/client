Page.patch(function(state) {
	if (Page.samePath(state, Page.parse())) return;
	return Promise.all(Array.from(document.querySelectorAll('element-query')).map(function(node) {
		return node.refresh(state);
	}));
});

class HTMLElementQuery extends HTMLCustomElement {
	static find(name, value) { // FIXME should move elsewhere
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
	static filterQuery(query) { // FIXME should move elsewhere
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
	refresh(state) {
		var me = this;
		if (me._refreshing || me.closest('[contenteditable]')) return;
		if (!state) state = Page.parse();
		// first find out if state.query has a key in this.dataset.keys
		// what do we do if state.query has keys that are used by a form in this query template ?
		var keys = [];
		if (me.dataset.keys) {
			try {
				keys = JSON.parse(me.dataset.keys);
			} catch(err) {
				console.error("Cannot parse element-query data-keys attribute", err);
			}
		}
		var candidates = 0;
		var query = {};
		keys.forEach(function(key) {
			if (state.query[key] !== undefined) {
				candidates++;
				query[key] = state.query[key];
			}
		});
		if (keys.length && !candidates) {
			// do not refresh because expected keys are not in query
			return;
		}
		// do not refresh if already queried with the same query
		var queryJson = JSON.stringify(query);
		if (queryJson == me.dataset.query) return;
		me.dataset.query = queryJson;
		// build
		var opts = {
			state: state
		};
		var queryId = me.getAttribute('block-id');
		if (me.dataset.remote == "true") {
			opts.pathname = `/.api/query/${queryId}`;
			opts.query = query;
		}
		var view = me.lastElementChild;
		var template = me.firstElementChild;
		if (template.children.length > 0) {
			// remove all block-id from template
			var rnode;
			while (rnode = template.querySelector('[block-id]')) rnode.removeAttribute('block-id');
			opts.element = {
				name: 'template_element_' + queryId,
				html: template.innerHTML
			};
		}
		me._refreshing = true;
		me.classList.remove('error', 'warning', 'success');
		me.classList.add('loading');
		return Pageboard.build(opts).then(function(node) {
			view.textContent = '';
			view.appendChild(node);
			me.classList.add('success');
		}).catch(function(err) {
			me.classList.add('error');
			console.error("Error building", opts, err);
		}).then(function() {
			me.classList.remove('loading');
			me._refreshing = false;
		});


		/*
		var vars = {};
		var missing = 0;
		var candidate = 0;
		if (this.dataset.type) {
			var form = document.querySelector(`form[data-type="${this.dataset.type}"]`);
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
				var val = `[$query.${key}|isUndefined]`.fuse({$query: query}, Object.assign({
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
		// TODO add ability to merge $page, $site, $host, $path ...?
		if (this.dataset.nocall == "true") {
			template.fuse({}, {
				$query: vars
			}, HTMLElementQuery.filters);
			while (template.firstChild) results.appendChild(template.firstChild);
			this._refreshing = false;
			return;
		}
		form.classList.remove('success', 'error', 'warning', 'loading');
		form.classList.add('loading');
		return Pageboard.fetch('get', '/.api/query', vars).then(function(answer) {
			template.fuse(answer.data, {
				$query: vars,
				$schema: answer.schemas
			}, HTMLElementQuery.filters);
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
		*/
	}
}

HTMLCustomElement.define('element-query', HTMLElementQuery);

