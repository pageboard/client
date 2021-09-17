class HTMLElementTemplate extends VirtualHTMLElement {
	loading = false;
	infinite = false;

	patch(state) {
		this.ownTpl.prerender();
		if (this.isContentEditable || this.loading || this.closest('[block-content="template"]')) {
			return;
		}
		return this.fetch(state);
	}

	fetch(state) {
		const disabled = (this.getAttribute('disabled') || '').fuse({
			$query: state.query
		}, state.scope);
		const action = disabled ? null : this.getAttribute('action');

		const $query = state.templatesQuery(this);
		const missings = $query == null;

		// redirections are only allowed to use collected query params
		const data = { $query };

		return Promise.resolve().then(() => {
			this.toggleMessages();
			if (missings) {
				this.ownView.textContent = '';
				data.$status = 400;
				data.$statusText = 'Missing Query Parameters';
			} else {
				const loader = action
					? Pageboard.fetch('get', action, $query)
					: Promise.resolve();
				this.loading = true;
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
		}).catch((err) => {
			data.$status = -1;
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		}).then(() => {
			this.classList.remove('loading');
			this.loading = false;
			if (data.$status == null) return;
			const redirect = this.getRedirect(data.$status);
			if (!redirect) {
				if (this.toggleMessages(data.$status)) {
					// report statusCode because it is meant to be shown
					if (data.$status > (state.status || 0)) {
						state.status = data.$status;
						state.statusText = data.$statusText;
					}
				}
				return;
			}

			const loc = Page.parse(redirect).fuse(data, state.scope);
			state.status = 301;
			state.statusText = `Form Redirection ${data.$status}`;
			state.location = loc.toString();
		});
	}

	getRedirect(status) {
		const name = ((n) => {
			if (n >= 200 && n < 400) return 'success';
			else if (n == 404) return 'notfound';
			else if (n == 401 || n == 403) return 'unauthorized';
			else if (n == 400) return 'badrequest';
			else return 'error';
		})(status);
		return this.getAttribute(name);
	}

	toggleMessages(status = null, parent = this.ownView) {
		const name = ((n) => {
			if (n >= 200 && n < 300) return "success";
			else if (n >= 400 && n < 500) return "warning";
			else if (n || n === 0) return "error";
		})(status);
		const statusMsg = parent.querySelector(
			`[block-type="message"][data-status="${status}"]`
		);
		let found = false;
		parent.querySelectorAll(`[block-type="message"]`).forEach(node => {
			if (node.closest('[action]') != this) return;
			let show = node == statusMsg;
			if (!show && !statusMsg) {
				if (name && node.classList.contains(name)) show = true;
				const nstatus = node.dataset.status;
				if (nstatus && nstatus == status) show = true;
			}
			if (show) found = true;
			node.classList.toggle('visible', show);
		});
		return found;
	}

	render(data, state) {
		const view = this.ownView;
		const scope = Object.assign({}, state.scope);
		const tmpl = this.ownTpl.content.cloneNode(true);
		tmpl.querySelectorAll('[block-id]')
			.forEach(node => node.removeAttribute('block-id'));

		// allow sub-templates to merge current data
		tmpl.querySelectorAll('template').forEach(tpl => {
			if (tpl.parentNode.nodeName == this.nodeName || !tpl.content) return;
			tpl.content.fuse(data, {
				$filters: Object.assign({}, scope.$filters, { repeat() { } })
			});
			// get rid of block-id in those templates to avoid
			// pagecut from dying on them
			tpl.content.querySelectorAll('[block-id]')
				.forEach(node => node.removeAttribute('block-id'));
		});

		const collector = state.collector();

		const el = {
			name: 'element_template_' + String(Math.round(Date.now() * Math.random())).substr(-6),
			dom: tmpl,
			filters: { '||': (v, w) => collector.filter(v, w) },
			contents: tmpl.querySelectorAll('[block-content]').map((node) => {
				return {
					id: node.getAttribute('block-content'),
					nodes: 'block+'
				};
			})
		};
		for (const [key, val] of Object.entries(state.data)) {
			if (key.startsWith('$') && scope[key] == null) scope[key] = val;
		}
		scope.$pathname = state.pathname;
		scope.$query = state.query;
		scope.$referrer = state.referrer.pathname || state.pathname;

		if (!this.infinite) {
			view.textContent = '';
		} else {
			this.infinite = false;
		}
		const node = Pageboard.render(data, scope, el);

		if (Object.keys(collector.missings).length) {
			state.statusText = `Missing Query Parameters`;
			state.status = 400;
			// eslint-disable-next-line no-console
			console.warn(state.statusText, Object.keys(collector.missings).join(', '));
		} else {
			view.appendChild(node);
		}
	}

	get ownTpl() {
		return this.children.find(
			node => node.matches('template,script[type="text/html"]')
		);
	}

	get ownView() {
		return this.children.find(node => node.matches('.view'));
	}
}
HTMLTemplateElement.prototype.prerender = function () {
	if (this.isContentEditable || document.visibilityState != "prerender") return this;
	const doc = this.ownerDocument;
	let tmpl = this;
	const dest = doc.createElement('script');
	dest.type = "text/html";
	const helper = doc.createElement('div');
	helper.textContent = tmpl.content.innerHTML;
	dest.textContent = helper.innerHTML;
	dest.content = tmpl.content;
	tmpl.replaceWith(dest);
	tmpl = dest;
	return tmpl;
};

HTMLScriptElement.prototype.prerender = function () {
	const doc = this.ownerDocument;
	const helper = doc.createElement('div');
	helper.innerHTML = this.textContent;
	const tmpl = doc.createElement('template');
	if (!tmpl.content) {
		tmpl.content = doc.createDocumentFragment();
		tmpl.content.appendChild(this.dom(helper.textContent));
	} else {
		tmpl.innerHTML = helper.textContent;
	}
	this.replaceWith(tmpl);
	this.textContent = helper.textContent = '';
	return tmpl;
};

VirtualHTMLElement.define('element-template', HTMLElementTemplate);

Page.Loc.prototype.fuse = function (data, scope) {
	this.pathname = this.pathname.fuse(data, scope);
	const q = this.query;
	for (const [key, val] of Object.entries(q)) {
		q[key] = typeof val == "string" ? val.fuse(data, scope) : val;
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
		const { query, vars } = this.state;
		if (path.length > 1) {
			const key = path.slice(1).join('.');
			const undef = val === undefined;
			if (undef) {
				this.missings[key] = true;
			} else {
				delete this.missings[key];
			}
			if (!vars[key]) vars[key] = !undef;
			this.query[key] = val;
		} else if (typeof val == "string") {
			const isEnc = what.expr.filters[what.expr.filters.length - 1]?.name == "enc";
			const loc = Page.parse(isEnc ? '?' + decodeURIComponent(val) : val).query;
			for (const [key, val] of Object.entries(loc)) {
				if (query[key] === val) vars[key] = true;
				this.query[key] = val;
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
