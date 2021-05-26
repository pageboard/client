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
		const action = this.getAttribute('action');
		const params = this.getAttribute('parameters') || '';
		const $query = {};
		const scope = Object.assign({}, state.scope);
		let missings = 0;
		scope.$filters = Object.assign({}, scope.$filters, {
			'||': function (val, what) {
				const key = what.expr.path.slice(1).join('.');
				if (val === undefined) {
					// it is the duty of the fetch block to redirect 400 if needed
					missings++;
				} else {
					state.vars[key] = true;
					if (val != null) $query[key] = val;
				}
			}
		});
		params.fuse({ $query: state.query }, scope);

		// redirections are only allowed to use collected query params
		const data = { $query };
		return Promise.resolve().then(() => {
			this.classList.remove('error', 'warning', 'success');
			if (missings > 0) {
				data.$status = 400;
			} else {
				const loader = action
					? Pageboard.fetch('get', action, $query)
					: Promise.resolve();
				this._refreshing = true;
				if (action) this.classList.add('loading');
				return Pageboard.bundle(loader, state).then((res) => {
					if (res) {
						data.$response = res;
						data.$status = res.status;
					}
					this.render(res, state);
				});
			}
		}).catch(function(err) {
			data.$status = -1;
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		}).then(() => {
			this.classList.remove('loading');
			this._refreshing = false;
			if (data.$status == null) return;
			const name = '[$status|statusClass]'.fuse(data, state.scope);
			if (name) this.classList.add(name);
			const statusName = `[$status|statusName]`.fuse(data, state.scope);
			const redirect = this.getAttribute(statusName);
			if (!redirect) {
				return;
			}
			// redirections must work when prerendered too
			const message = {
				notfound: 'Not Found',
				unauthorized: 'Unauthorized',
				error: 'Error',
				badrequest: 'Bad Request',
				success: 'Moved Permanently'
			}[statusName];

			const loc = Page.parse(redirect).fuse(data, state.scope);
			const locStr = Page.format(loc);
			Pageboard.equivs({
				Status: `301 ${message}`,
				Location: locStr
			});
			if (state.scope.$write) {
				console.info("redirects to", locStr);
			} else {
				state.push(loc);
			}
		});
	}
	render(data, state) {
		if (this.children.length != 2) return;
		const view = this.lastElementChild;
		const scope = Object.assign({}, state.scope);
		const tmpl = this.firstElementChild.content.cloneNode(true);

		// allow sub-templates to merge current data
		tmpl.querySelectorAll('template').forEach(tpl => {
			if (tpl.parentNode.nodeName == this.nodeName || !tpl.content) return;
			tpl.content.fuse(data, {
				$filters: Object.assign({}, scope.$filters, { repeat() { } })
			});
		});

		const collector = state.collector();

		const el = {
			name: 'element_template_' + (Math.round(Date.now() * Math.random()) + '').substr(-6),
			dom: tmpl,
			filters: { '||': (v, w) => collector.filter(v, w) },
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
		if (Object.keys(collector.missings).length) {
			// eslint-disable-next-line no-console
			console.error("Missing query parameters", Object.keys(collector.missings));
			state.scope.$status = 400;
		} else {
			view.appendChild(node);
			if (collector.used) state.scroll({
				once: true,
				node: this.parentNode,
				behavior: 'smooth'
			});
		}
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


class QueryCollectorFilter {
	constructor(state, query = {}) {
		this.used = false;
		this.missings = {};
		this.query = query;
		this.state = state;
	}
	filter(val, what) {
		const path = what.scope.path;
		if (path[0] != "$query") return val;
		this.used = true;
		let key;
		const { query, vars } = this.state;
		if (path.length > 1) {
			key = path.slice(1).join('.');
			const undef = val === undefined;
			if (undef) {
				this.missings[key] = true;
			} else {
				delete this.missings[key];
			}
			if (!vars[key]) vars[key] = !undef;
			this.query[key] = val;
		} else {
			for (key in query) vars[key] = true;
		}
		return val;
	}
}

Page.State.prototype.collector = function (query) {
	return new QueryCollectorFilter(this, query);
};
