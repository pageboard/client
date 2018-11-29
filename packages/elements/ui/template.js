class HTMLElementTemplate extends HTMLCustomElement {
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) Page.patch(this.patch);
	}
	patch(state) {
		var me = this;
		if (me._refreshing || me.closest('[contenteditable],[block-content="template"]')) return;
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

		var queryId = me.getAttribute('block-id');
		var loader;
		var remote = me.dataset.remote == "true";
		if (remote) {
			loader = Pageboard.fetch('get', `/.api/query/${queryId}`, query);
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
		view.appendChild(node);
	}
}
Page.ready(function() {
	HTMLCustomElement.define('element-template', HTMLElementTemplate);
});

