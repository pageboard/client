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

		const $query = state.templatesQuery(this);
		const missings = $query == null;

		// redirections are only allowed to use collected query params
		const data = { $query };
		return Promise.resolve().then(() => {
			this.classList.remove('error', 'warning', 'success');
			if (missings) {
				data.$status = 400;
				data.$statusText = 'Missing query parameters';
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
						data.$statusText = res.statusText;
					}
					this.render(res, state);
				});
			}
		}).catch(function (err) {
			data.$status = -1;
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		}).then(() => {
			this.classList.remove('loading');
			this._refreshing = false;
			if (data.$status == null) return;
			const statusName = `[$status|statusName]`.fuse(data, state.scope);
			const redirect = this.getAttribute(statusName);
			if (!redirect) {
				const name = '[$status|statusClass]'.fuse(data, state.scope);
				if (name && this.lastElementChild.querySelector(`.${name}[block-type="message"]`)) {
					this.classList.add(name);
					// report statusCode because it is meant to be shown
					if (data.$status > state.status || 0) {
						state.status = data.$status;
						state.statusText = data.$statusText;
					}
				}
				return;
			}

			const message = {
				notfound: 'Not Found',
				unauthorized: 'Unauthorized',
				error: 'Error',
				badrequest: 'Bad Request',
				success: 'Moved Permanently'
			}[statusName];

			const loc = Page.parse(redirect).fuse(data, state.scope);
			const locStr = Page.format(loc);
			// prerendering tricks
			Pageboard.equivs({
				Status: `301 ${message}`,
				Location: locStr
			});
			if (state.scope.$write) {
				// eslint-disable-next-line no-console
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

		Object.keys(state.data).forEach(function (key) {
			if (key.startsWith('$') && scope[key] == null) scope[key] = state.data[key];
		});
		scope.$pathname = state.pathname;
		scope.$query = state.query;
		scope.$referrer = state.referrer.pathname || state.pathname;

		const node = Pageboard.render(data, scope, el);
		view.textContent = '';
		if (Object.keys(collector.missings).length) {
			state.statusText = `Missing query parameters`;
			state.status = 400;
			// eslint-disable-next-line no-console
			console.warn(state.statusText, Object.keys(collector.missings).join(', '));
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

VirtualHTMLElement.define('element-template', HTMLElementTemplate);

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
		} else if (typeof val == "string") {
			const isEnc = (what.expr.filters[what.expr.filters.length - 1] || {}).name == "enc";
			const obj = Page.parse(isEnc ? '?' + decodeURIComponent(val) : val).query;
			for (key in obj) {
				if (query[key] === obj[key]) vars[key] = true;
				this.query[key] = obj[key];
			}
		}
		return val;
	}
}

Page.State.prototype.collector = function (query) {
	return new QueryCollectorFilter(this, query);
};

Page.State.prototype.templatesQuery = function (node) {
	const state = this;
	const params = node.getAttribute('parameters') || '';
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
	params.split(' ').map(str => {
		return `[${str}]`;
	}).join('').fuse({ $query: state.query }, scope);
	if (missings > 0) return null;
	else return $query;
};
