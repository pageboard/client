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
		if (me._refreshing || me.closest('[contenteditable],[block-content="template"]')) return;
		// first find out if state.query has a key in this.keys
		// what do we do if state.query has keys that are used by a form in this query template ?
		var expressions = this.getAttribute('block-expr');
		var vars = {};
		var scope = state.scope;
		if (expressions) {
			try {
				expressions = JSON.parse(expressions);
			} catch(ex) {
				console.warn("block-expr attribute should contain JSON");
			}
			scope.$filters['||'] = function(val, what) {
				var path = what.scope.path.slice();
				if (path[0] == "$query") {
					path = path.slice(1).join('.');
					if (path.length && val != null) vars[path] = val;
				}
			};
			Pageboard.merge(expressions, function(val) {
				if (typeof val == "string") return val.fuse({$query: state.query}, scope);
			});
			delete scope.$filters['||'];
		}
		var ok = false;
		Object.keys(vars).forEach(function(key) {
			ok = state.vars[key] = true;
		});
		if (!ok) return;

		var queryId = me.getAttribute('block-id');
		var loader;
		var remote = me.remote;
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

		return Pageboard.bundle(loader, state.scope).then(function(res) {
			me.render(res, state);
			if (remote) me.classList.add('success');
		}).catch(function(err) {
			me.classList.add('error');
			console.error("Error building", err);
		}).then(function() {
			me.classList.remove('loading');
			me._refreshing = false;
		});
	}
	render(data, state) {
		if (this.closest('[contenteditable]')) return;
		if (this.children.length != 2) return;
		var view = this.lastElementChild;
		var template = this.firstElementChild.cloneNode(true);
		template.removeAttribute('block-content');
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
						state.vars[path.slice(1).join('.')] = true;
					}
				}
			}
		};
		scope.$pathname = state.pathname;
		scope.$query = state.query;
		scope.$referrer = state.referrer.pathname || state.pathname;

		var node = Pageboard.render(data || {type: scope.$element.name}, scope);

		view.textContent = '';
		while (node.firstChild) view.appendChild(node.firstChild);
	}
}
Page.ready(function() {
	HTMLCustomElement.define('element-template', HTMLElementTemplate);
});

