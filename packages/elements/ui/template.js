class HTMLElementTemplate extends HTMLCustomElement {
	static get observedAttributes() {
		return ['remote', 'keys'];
	}
	static getVars(obj, map) {
		if (!map) map = {};
		Object.keys(obj).forEach(function(key) {
			var val = obj[key];
			if (typeof val == "string") {
				val.fuse({$query: {}}, {}, {
					'||': function(val, what) {
						var path = what.scope.path.slice();
						if (path[0] == "$query") {
							path = path.slice(1).join('.');
							if (path.length) map[path] = true;
						}
					}
				});
			} else if (val != null && typeof val == "object") {
				this.getVars(val, map);
			}
		}, this);
		return Object.keys(map);
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
		var candidates = 0;
		var expressions = this.getAttribute('block-expr');
		var vars;
		if (expressions) {
			try {
				expressions = JSON.parse(expressions);
			} catch(ex) {
				console.warn("block-expr attribute should contain JSON");
			}
			vars = this.constructor.getVars(expressions);
		} else {
			vars = [];
		}
		var queryParams = {};
		vars.forEach(function(key) {
			if (Object.prototype.hasOwnProperty.call(state.query, key)) {
				candidates++;
				queryParams[key] = state.query[key];
				state.vars[key] = true;
			}
		});
		if (vars.length && !candidates) {
			// this is only to avoid doing useless requests
			return;
		}

		var queryId = me.getAttribute('block-id');
		var loader;
		var remote = me.remote;
		if (remote) {
			// do not refresh if the same query was already done
			var queryStr = Page.format({pathname: "", query: queryParams});
			if (queryStr == me.dataset.query) return;
			me.dataset.query = queryStr;
			loader = Pageboard.fetch('get', `/.api/query/${queryId}`, queryParams);
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
		var template = this.firstElementChild;
		// remove all block-id from template
		var rnode;
		while ((rnode = template.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
		while ((rnode = template.querySelector('[block-expr]'))) rnode.removeAttribute('block-expr');

		var el = state.scope.$element = {
			name: 'template_element_' + this.getAttribute('block-id'),
			html: template.innerHTML,
			filters: {
				'||': function(val, what) {
					var path = what.scope.path;
					if (path[0] == "$query" && path.length > 1) {
						state.vars[path.slice(1).join('.')] = true;
					}
				}
			}
		};

		var node = Pageboard.render(data || {type: el.name}, state.scope);

		view.textContent = '';
		if (node) view.appendChild(node);
	}
}
Page.ready(function() {
	HTMLCustomElement.define('element-template', HTMLElementTemplate);
});

