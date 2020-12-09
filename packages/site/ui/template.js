class HTMLElementTemplate extends VirtualHTMLElement {
	static get defaults() {
		return {
			action: null
		};
	}
	static prepareTemplate(node) {
		if (node.isContentEditable) return node;
		var doc = node.ownerDocument;
		var tmpl = node;
		var helper;
		if (node.matches('script[type="text/html"]')) {
			helper = doc.createElement('div');
			helper.innerHTML = node.textContent;
			tmpl = doc.createElement('template');
			if (!tmpl.content) {
				tmpl.content = doc.createDocumentFragment();
				tmpl.content.appendChild(node.dom(helper.textContent));
			} else {
				tmpl.innerHTML = helper.textContent;
			}
			node.replaceWith(tmpl);
			node.textContent = helper.textContent = '';
		} else if (document.visibilityState == "prerender") {
			var dest = tmpl.dom(`<script type="text/html"></script>`);
			if (!helper) helper = doc.createElement('div');
			helper.textContent = tmpl.content.childNodes.map(child => {
				if (child.nodeType == Node.TEXT_NODE) return child.nodeValue;
				else return child.outerHTML;
			}).join('');
			dest.textContent = helper.innerHTML;
			dest.content = tmpl.content;
			tmpl.replaceWith(dest);
			tmpl = dest;
		}
		return tmpl;
	}

	patch(state) {
		this.constructor.prepareTemplate(this.firstElementChild);
		if (this.isContentEditable || this._refreshing || this.closest('[block-content="template"]')) return;
		return this.fetch(state);
	}
	fetch(state) {
		// first find out if state.query has a key in this.keys
		// what do we do if state.query has keys that are used by a form in this query template ?
		var expr = this.getAttribute('block-expr');
		var vars = {};
		var opts = this.options;
		var scope = state.scope;
		if (expr) {
			try {
				expr = JSON.parse(expr);
			} catch(ex) {
				console.warn("block-expr attribute should contain JSON");
				expr = {};
			}
			var missing = 0;
			var filters = scope.$filters;
			scope.$filters = Object.assign({}, filters, {
				'|': function(val, what) {
					var path = what.scope.path.slice();
					if (path[0] == "$query") {
						var name = path.slice(1).join('.');
						if (name.length && state.query[name] !== undefined) {
							val = state.query[name];
						}
					}
					return val;
				},
				'||': function(val, what) {
					var path = what.scope.path.slice();
					if (path[0] == "$query") {
						var name = path.slice(1).join('.');
						if (name.length) {
							if (val !== undefined) {
								if (val != null) vars[name] = val;
							} else {
								missing++;
							}
						}
					}
				}
			});
			Pageboard.merge(expr, function(val) {
				if (typeof val == "string") try {
					return val.fuse({$query: state.query}, scope);
				} catch(ex) {
					return val;
				}
			});
			scope.$filters = filters;
			Object.keys(vars).forEach(function(key) {
				state.vars[key] = true;
			});
			if (missing) return;
		} else if (!opts.action) {
			// non-remotes cannot know if they will need $query
		}
		var loader;
		if (opts.action) {
			var queryStr = Page.format({pathname: "", query: vars});
			if (queryStr == this.dataset.query) return;
			this.dataset.query = queryStr;
			loader = Pageboard.fetch('get', opts.action, vars);
		} else {
			loader = Promise.resolve();
		}
		this._refreshing = true;
		this.classList.remove('error', 'warning', 'success');
		if (opts.action) this.classList.add('loading');

		return Pageboard.bundle(loader, state).then((res) => {
			this.render(res, state);
		}).catch(function(err) {
			state.scope.$status = -1;
			console.error("Error building", err);
		}).then(() => {
			var name = '[$status|statusClass]'.fuse(state.scope);
			if (name) this.classList.add(name);
			this.classList.remove('loading');
			this._refreshing = false;
		});
	}
	render(data, state) {
		if (this.children.length != 2) return;
		var tmpl = this.firstElementChild.content.cloneNode(true);
		var view = this.lastElementChild;
		// remove all block-id from template - might be done in pagecut eventually
		var rnode;
		while ((rnode = tmpl.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
		// pagecut merges block-expr into block-data - contrast with above patch() method
		while ((rnode = tmpl.querySelector('[block-expr]'))) rnode.removeAttribute('block-expr');

		var scope = Object.assign({}, state.scope);
		var usesQuery = false;

		var el = {
			name: 'element_template_' + (Math.round(Date.now() * Math.random()) + '').substr(-6),
			dom: tmpl,
			filters: {
				'||': function(val, what) {
					var path = what.scope.path;
					if (path[0] != "$query") return;
					usesQuery = true;
					var key;
					if (path.length > 1) {
						// (b)magnet sets val to null so optional values are not undefined
						key = path.slice(1).join('.');
						var undef = val === undefined;
						if (!state.vars[key]) {
							if (undef) console.info("$query." + key, "is undefined");
							state.vars[key] = !undef;
						}
					} else {
						for (key in state.query) state.vars[key] = true;
					}
				}
			},
			contents: tmpl.querySelectorAll('[block-content]').map((node) => {
				return {
					id: node.getAttribute('block-content'),
					nodes: 'block+'
				};
			})
		};
		Object.keys(state.data).forEach(function(key) {
			if (key.startsWith('$') && scope[key] == null) scope[key] = state.data[key];
		});
		scope.$pathname = state.pathname;
		scope.$query = state.query;
		scope.$referrer = state.referrer.pathname || state.pathname;

		var node = Pageboard.render(data, scope, el);
		view.textContent = '';
		view.appendChild(node);
		if (usesQuery) state.scroll({
			once: true,
			node: this.parentNode,
			behavior: 'smooth'
		});
	}
}
Page.ready(function() {
	VirtualHTMLElement.define('element-template', HTMLElementTemplate);
});

