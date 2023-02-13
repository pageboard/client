class HTMLElementTemplate extends Page.Element {
	loading = false;
	#observer;
	#queue;
	#locked;
	#auto;

	patch(state) {
		this.ownTpl.prerender();
		if (this.isContentEditable) return;
		if (this.loading || this.closest('[block-content="template"]')) {
			return;
		}
		this.#auto = this.dataset.pagination && this.dataset.auto && this.dataset.stop && !(this.dataset.pagination in state.query);
		return this.fetch(state);
	}

	async fetch(state) {
		// FIXME remove this heresy
		const disabled = (this.getAttribute('disabled') || '').fuse({
			$query: state.query
		}, state.scope);
		// end of heresy
		const action = disabled ? null : this.getAttribute('action');
		const $query = state.templatesQuery(this);
		const missings = $query == null;

		// redirections are only allowed to use collected query params
		const data = { $query };


		this.toggleMessages();
		if (missings) {
			this.ownView.textContent = '';
			data.$status = 400;
			data.$statusText = 'Missing Query Parameters';
		} else try {
			if (this.#auto) {
				$query[this.dataset.pagination] = this.dataset.stop;
			}
			const res = action ? await Pageboard.fetch('get', action, $query) : null;
			this.loading = true;
			if (action) this.classList.add('loading');
			await Pageboard.bundle(state, res);
			if (res) {
				data.$response = res;
				data.$status = res.status;
				data.$statusText = res.statusText;
			}
			this.render(res, state);
		} catch(err) {
			data.$status = -1;
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		}
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
	}

	getRedirect(status) {
		const name = (n => {
			if (n >= 200 && n < 400) return 'success';
			else if (n == 404) return 'notfound';
			else if (n == 401 || n == 403) return 'unauthorized';
			else if (n == 400) return 'badrequest';
			else return 'error';
		})(status);
		return this.getAttribute(name);
	}

	toggleMessages(status = null, parent = this.ownView) {
		const name = (n => {
			if (n >= 200 && n < 300) return "success";
			else if (n >= 400 && n < 500) return "warning";
			else if (n || n === 0) return "error";
		})(status);
		const statusMsg = parent.querySelector(
			`[block-type="message"][data-status="${status}"]`
		);
		let found = false;
		for (const node of parent.querySelectorAll(`[block-type="message"]`)) {
			if (node.closest('[action]') != this) continue;
			let show = node == statusMsg;
			if (!show && !statusMsg) {
				if (name && node.classList.contains(name)) show = true;
				const nstatus = node.dataset.status;
				if (nstatus && nstatus == status) show = true;
			}
			if (show) found = true;
			node.classList.toggle('visible', show);
		}
		return found;
	}

	render(data, state) {
		const view = this.ownView;
		const scope = state.scope.copy();
		const tmpl = this.ownTpl.content.cloneNode(true);
		for (const node of tmpl.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}

		// allow sub-templates to merge current data
		for (const tpl of tmpl.querySelectorAll('template')) {
			if (tpl.parentNode.nodeName == this.nodeName || !tpl.content) continue;
			tpl.content.fuse(data, {
				$filters: {
					...scope.$filters,
					repeat() { }
				}
			});
			// get rid of block-id in those templates to avoid
			// pagecut from dying on them
			for (const node of tpl.content.querySelectorAll('[block-id]')) {
				node.removeAttribute('block-id');
			}
		}

		const collector = state.collector();

		const el = {
			name: 'element_template_' + String(Math.round(Date.now() * Math.random())).slice(-6),
			dom: tmpl,
			hooks: {
				afterAll(ctx, v) {
					collector.filter(ctx, v);
					return v;
				}
			},
			contents: tmpl.querySelectorAll('[block-content]').map(node => {
				return {
					id: node.getAttribute('block-content'),
					nodes: 'block+'
				};
			})
		};
		for (const [key, val] of Object.entries(state.data)) {
			if (key.startsWith('$') && scope[key] == null) scope[key] = val;
		}

		// we need to keep track of [start, end]
		// fetch needs to know if response offset is after stop
		// or before start
		const { offset, limit } = data;
		const count = data.items?.length ?? 0;
		let start = parseInt(this.dataset.start);
		if (Number.isNaN(start)) start = offset;
		let stop = parseInt(this.dataset.stop);
		if (Number.isNaN(stop)) stop = offset;

		const node = Pageboard.render(data, scope, el);

		let append = true;
		let replace = false;
		if (this.#auto) {
			if (offset <= start) {
				start = offset;
				append = false;
			}
			if (offset + count >= stop) {
				stop = offset + count;
			} else if (append) {
				replace = true;
			}
		} else {
			replace = true;
			start = offset;
			stop = offset + count;
		}

		if (offset != null && limit != null) {
			Object.assign(this.dataset, { count, start, stop, limit });
		}

		if (Object.keys(collector.missings).length) {
			state.statusText = `Missing Query Parameters`;
			state.status = 400;
			// eslint-disable-next-line no-console
			console.warn(state.statusText, Object.keys(collector.missings).join(', '));
		} else {
			if (replace) view.textContent = '';
			if (append) view.appendChild(node);
			else view.insertBefore(node, view.firstChild);
		}
	}

	get ownTpl() {
		return this.children.find(
			node => node.matches('template,script[type="text/html"]')
		);
	}

	get ownView() {
		return this.children.find(
			node => node.matches('.view')
		) ?? this.appendChild(
			this.dom(`<div class="view"></view>`)
		);
	}

	#more(state) {
		this.#locked = true;

		if (this.#queue) this.#queue = this.#queue.then(() => {
			if (this.disabled) return;
			return state.reload({vary: 'patch'});
		}).then(() => {
			this.#locked = false;
		});
	}

	setup(state) {
		if (this.isContentEditable) return;
		if (this.dataset.auto != "true") return;
		this.#queue = Promise.resolve();
		this.#observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (!this.#locked) this.#more(state);
				}
			});
		}, {
			threshold: [1.0]
		});
		const observed = this.lastElementChild.matches('.helper') ?
			this.lastElementChild :
			this.appendChild(this.dom(`<div class="helper"></div>`));
		this.#observer.observe(observed);
	}

	close() {
		this.#queue = null;
		if (this.#observer) {
			this.#observer.unobserve(this.lastElementChild);
			this.#observer.disconnect();
			this.#observer = null;
		}
	}
}

HTMLTemplateElement.prototype.prerender = function () {
	if (this.isContentEditable || !document.hidden) {
		return this;
	}
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

Object.getPrototypeOf(Page.constructor).prototype.fuse = function (data, scope) {
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
	filter(ctx, val) {
		const path = ctx.expr.path;
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
			const isEnc = ctx.expr.filters[ctx.expr.filters.length - 1]?.[0] == "enc";
			const loc = Page.parse(isEnc ? '?' + decodeURIComponent(val) : val).query;
			for (const [key, val] of Object.entries(loc)) {
				if (query[key] === val) vars[key] = true;
				this.query[key] = val;
			}
		}
		return val;
	}
}

Page.constructor.prototype.collector = function (query) {
	return new QueryCollectorFilter(this, query);
};

Page.constructor.prototype.templatesQuery = function (node) {
	const state = this;
	const params = node.getAttribute('parameters') || '';
	const $query = {};
	const scope = state.scope.copy();
	let missings = 0;
	scope.$hooks = {
		...scope.$hooks,
		afterAll: function (ctx, val) {
			if (val === undefined) {
				// it is the duty of the fetch block to redirect 400 if needed
				missings++;
			} else if (ctx.expr.path.length > 1) {
				const key = ctx.expr.path.slice(1).join('.');
				state.vars[key] = true;
				if (val != null) $query[key] = val;
			} else if (ctx.expr.path[0] == "$pathname") {
				$query["$pathname"] = val;
			}
		}
	};
	params.split(' ').map(str => {
		return `[${str}]`;
	}).join('').fuse({ $query: state.query, $pathname: state.pathname }, scope);
	if (missings > 0) return null;
	else return $query;
};

Page.define('element-template', HTMLElementTemplate);
