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
	init() {
		this.refresh = this.refresh.bind(this);
	}
	connectedCallback() {
		Page.patch(this.refresh);
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) Page.patch(this.refresh);
	}
	update() {
		return Page.patch(this.refresh);
	}
	refresh(state) {
		var me = this;
		if (me._refreshing || me.closest('[contenteditable]')) return;
		// first find out if state.query has a key in this.dataset.keys
		// what do we do if state.query has keys that are used by a form in this query template ?
		var keys = [];
		if (me.dataset.keys) {
			keys = me.dataset.keys.split(',');
		}
		var candidates = 0;
		var query = {};
		keys.forEach(function(key) {
			if (Object.prototype.hasOwnProperty.call(state.query, key)) {
				candidates++;
				query[key] = state.query[key];
				state.vars[key] = true;
			}
		});
		if (keys.length && !candidates) {
			// this is only to avoid doing useless requests
			return;
		}
		// do not refresh if the same query was already done
		var queryStr = Page.format({query: query});
		if (queryStr == me.dataset.query) return;
		me.dataset.query = queryStr;
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
			while ((rnode = template.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
			opts.element = {
				name: 'template_element_' + queryId,
				html: template.innerHTML
			};
		}
		me._refreshing = true;
		me.classList.remove('error', 'warning', 'success');
		me.classList.add('loading');
		return Pageboard.build(opts).then(function({node, data}) {
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
	}
}

window.HTMLElementQuery = HTMLCustomElement.define('element-query', HTMLElementQuery);

