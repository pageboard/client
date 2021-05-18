class HTMLElementTemplate extends VirtualHTMLElement {
	static prepareTemplate(node) {
		if (node.isContentEditable) return node;
		const doc = node.ownerDocument;
		let tmpl = node;
		let helper;
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
			const dest = tmpl.dom(`<script type="text/html"></script>`);
			if (!helper) helper = doc.createElement('div');
			helper.textContent = tmpl.content.innerHTML;
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
		let expr = this.getAttribute('block-expr');
		const action = this.getAttribute('action');
		const $query = {};
		const scope = state.scope;
		if (expr) {
			try {
				expr = JSON.parse(expr);
			} catch(ex) {
				// eslint-disable-next-line no-console
				console.warn("block-expr attribute should contain JSON");
				expr = {};
			}
			let missing = 0;
			const filters = scope.$filters;
			scope.$filters = Object.assign({}, filters, {
				'|': function(val, what) {
					const path = what.scope.path.slice();
					if (path[0] == "$query") {
						const name = path.slice(1).join('.');
						if (name.length && state.query[name] !== undefined) {
							val = state.query[name];
						}
					}
					return val;
				},
				'||': function(val, what) {
					const path = what.scope.path.slice();
					if (path[0] == "$query") {
						const name = path.slice(1).join('.');
						if (name.length) {
							if (val !== undefined) {
								if (val != null) $query[name] = val;
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
			Object.keys($query).forEach(function(key) {
				state.vars[key] = true;
			});
			if (missing) return;
		} else if (!action) {
			// non-remotes cannot know if they will need $query
		}
		const loader = action ? Pageboard.fetch('get', action, $query) : Promise.resolve();

		this._refreshing = true;
		this.classList.remove('error', 'warning', 'success');
		if (action) this.classList.add('loading');

		const data = { $query };

		return Pageboard.bundle(loader, state).then((res) => {
			data.$response = res;
			state.scope.$status = res.status;
			this.render(res, state);
		}).catch(function(err) {
			state.scope.$status = -1;
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		}).then(() => {
			this.classList.remove('loading');
			const name = '[$status|statusClass]'.fuse(data, state.scope);
			if (name) this.classList.add(name);
			this._refreshing = false;

			const statusName = `[$status|statusName]`.fuse(data, state.scope);
			const redirect = this.getAttribute(statusName);
			if (!redirect) return;
			// redirections must work when prerendered too
			const message = {
				notfound: 'Not Found',
				unauthorized: 'Unauthorized',
				error: 'Error',
				badrequest: 'Bad Request',
				success: 'Moved Permanently'
			}[statusName];
			const loc = Page.parse(redirect).fuse(data, state.scope);
			Pageboard.equivs({
				Status: `301 ${message}`,
				Location: Page.format(loc)
			});
			state.push(loc);
		});
	}
	render(data, state) {
		if (this.children.length != 2) return;
		const tmpl = this.firstElementChild.content.cloneNode(true);
		const view = this.lastElementChild;
		const scope = Object.assign({}, state.scope);
		// allow sub-templates to merge current data
		tmpl.querySelectorAll('template').forEach(tpl => {
			if (tpl.parentNode.nodeName == this.nodeName || !tpl.content) return;
			tpl.content.fuse(data, {
				$filters: Object.assign({}, scope.$filters, { repeat() { } })
			});
		});
		// remove all block-id from template - might be done in pagecut eventually
		let rnode;
		while ((rnode = tmpl.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
		// pagecut merges block-expr into block-data - contrast with above patch() method
		while ((rnode = tmpl.querySelector('[block-expr]'))) rnode.removeAttribute('block-expr');

		let usesQuery = false;

		const el = {
			name: 'element_template_' + (Math.round(Date.now() * Math.random()) + '').substr(-6),
			dom: tmpl,
			filters: {
				'||': function(val, what) {
					const path = what.scope.path;
					if (path[0] != "$query") return;
					usesQuery = true;
					let key;
					if (path.length > 1) {
						// (b)magnet sets val to null so optional values are not undefined
						key = path.slice(1).join('.');
						const undef = val === undefined;
						if (!state.vars[key]) {
							if (undef) {
								// eslint-disable-next-line no-console
								console.info("$query." + key, "is undefined");
							}
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

		const node = Pageboard.render(data, scope, el);

		view.textContent = '';
		view.appendChild(node);
		if (usesQuery) state.scroll({
			once: true,
			node: this.parentNode,
			behavior: 'smooth'
		});
	}
}
Page.ready(function () {
	Object.defineProperty(DocumentFragment.prototype, 'innerHTML', {
		configurable: true,
		get() {
			return this.childNodes.map(child => {
				if (child.nodeType == Node.TEXT_NODE) return child.nodeValue;
				else return child.outerHTML;
			}).join('');
		}
	});
	VirtualHTMLElement.define('element-template', HTMLElementTemplate);
});

Page.State.prototype.fuse = function (data, scope) {
	this.pathname = this.pathname.fuse(data, scope);
	const q = this.query;
	for (let key in q) {
		let val = q[key];
		if (typeof val == "string") {
			val = val.fuse(data, scope);
		}
		q[key] = val;
	}
	return this;
};
