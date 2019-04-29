class HTMLElementTemplate extends HTMLCustomElement {
	static get observedAttributes() {
		return ['remote', 'keys'];
	}
	get remote() {
		return this.hasAttribute('remote');
	}
	set remote(val) {
		if (val) this.setAttribute('remote', '');
		else this.removeAttribute('remote');
	}
	get keys() {
		var str = this.getAttribute('keys');
		if (str) return str.split(',');
		else return [];
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		Page.patch(this);
	}
	patch(state) {
		var me = this;
		if (me._refreshing || me.closest('[block-content="template"]')) return;
		// first find out if state.query has a key in this.keys
		// what do we do if state.query has keys that are used by a form in this query template ?
		var expr = this.getAttribute('block-expr');
		var vars = {};
		var scope = state.scope;
		var remote = me.remote;
		if (expr) {
			try {
				expr = JSON.parse(expr);
			} catch(ex) {
				console.warn("block-expr attribute should contain JSON");
				expr = {};
			}
			scope.$filters['||'] = function(val, what) {
				var path = what.scope.path.slice();
				if (path[0] == "$query") {
					path = path.slice(1).join('.');
					if (path.length && val != null) vars[path] = val;
				}
			};
			Pageboard.merge(expr, function(val) {
				if (typeof val == "string") try {
					return val.fuse({$query: state.query}, scope);
				} catch(ex) {
					return val;
				}
			});
			delete scope.$filters['||'];
			var varsKeys = Object.keys(vars);
			varsKeys.forEach(function(key) {
				state.vars[key] = true;
			});
			if (Object.keys(expr).length && varsKeys.length == 0) return;
		} else if (!remote) {
			// non-remotes cannot know if they will need $query
		}
		var queryId = me.getAttribute('block-id');
		var loader;
		if (remote) {
			var queryStr = Page.format({pathname: "", query: vars});
			if (queryStr == me.dataset.query) return;
			me.dataset.query = queryStr;
			loader = Pageboard.fetch('get', `/.api/query/${queryId}`, vars);
		} else {
			loader = Promise.resolve();
		}
		me._refreshing = true;
		me.classList.remove('error', 'warning', 'success');
		if (remote) me.classList.add('loading');

		return Pageboard.bundle(loader, state).then(function(res) {
			me.render(res, state);
		}).catch(function(err) {
			state.scope.$status = -1;
			console.error("Error building", err);
		}).then(function() {
			var name = '[$status|statusClass]'.fuse(state.scope);
			if (name) me.classList.add(name);
			me.classList.remove('loading');
			me._refreshing = false;
		});
	}
	render(data, state) {
		if (this.closest('[contenteditable]')) return;
		if (this.children.length != 2) return;
		var view = this.lastElementChild;
		var template = this.firstElementChild;
		if (template.content) template = template.content;
		// remove all block-id from template
		var rnode;
		while ((rnode = template.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
		while ((rnode = template.querySelector('[block-expr]'))) rnode.removeAttribute('block-expr');

		var scope = Object.assign({}, state.scope);

		scope.$element = {
			name: 'template_element_' + this.getAttribute('block-id'),
			dom: template,
			filters: {
				'||': function(val, what) {
					var path = what.scope.path;
					if (path[0] == "$query" && path.length > 1) {
						// (b)magnet sets val to null so optional values are not undefined
						var key = path.slice(1).join('.');
						var undef = val === undefined;
						if (undef) console.info("$query." + key, "is undefined");
						if (!state.vars[key]) {
							state.vars[key] = !undef;
						}
					}
				}
			}
		};
		scope.$grants = state.data.$grants;
		scope.$pathname = state.pathname;
		scope.$query = state.query;
		scope.$referrer = state.referrer.pathname || state.pathname;

		var node = Pageboard.render(data, scope);

		view.textContent = '';
		while (node.firstChild) view.appendChild(node.firstChild);
		if (!state.scrollIntoView && view.scrollIntoView) {
			state.scrollIntoView = true;
			view.scrollIntoView({
				block: "nearest"
			});
		}
	}
}
Page.ready(function() {
	HTMLCustomElement.define('element-template', HTMLElementTemplate);
});

