class HTMLElementTemplate extends Page.Element {
	loading = false;
	#observer;
	#queue;
	#locked;
	#auto;

	patch(state) {
		this.ownTpl.prerender();
		if (state.scope.$write) return;
		if (this.loading || this.closest('[block-content="template"]')) {
			return;
		}
		if (state.referrer && !state.sameQuery(state.referrer)) {
			delete this.dataset.stop;
			delete this.dataset.start;
		}
		const offname = this.dataset.pagination;
		if (offname) {
			state.ivars.add(offname);
			this.#auto = this.dataset.auto && this.dataset.stop && !(offname in state.query);
		} else {
			this.#auto = false;
		}
		return this.fetch(state);
	}

	async fetch(state) {
		const scope = state.scope.copy();
		let action = this.getAttribute('action');
		let response = {};
		const collector = state.collector();
		const request = state.templatesQuery(this, collector);
		if (collector.failed) {
			action = null; // missing parameters
			response.status = 400;
		} else if (action == null) {
			response.status = 200;
		}

		if (action) try {
			if (this.#auto) {
				request[this.dataset.pagination] = this.dataset.stop;
			}
			request.lang ??= scope.$lang;
			response = await state.fetch('get', action, request);
			this.loading = true;
			this.classList.add('loading');
			await scope.import(response);
		} catch (err) {
			response.status = -1; // FIXME check toggleMessages
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		} finally {
			this.classList.remove('loading');
			this.loading = false;
		}
		// TODO injected bundles cannot register scope.$filters before render
		const frag = await this.#render(state, scope, response, collector);
		const redirect = this.getRedirect(scope.$status);
		if (redirect) {
			scope.$request = request;
			scope.$response = response;
			const loc = Page.parse(redirect).fuse({}, scope);
			state.status = 301;
			state.statusText = `Form Redirection ${scope.$status}`;
			state.location = loc.toString();
		} else {
			const msg = this.toggleMessages(scope.$status, frag);
			if (msg) {
				if (!this.contains(frag)) this.ownView.appendChild(msg);
			} else if (scope.$status == 400 && collector.failed) {
				scope.$status = 200;
				scope.$statusText = "OK";
			}
			if (scope.$status > (state.status || 0)) {
				state.status = scope.$status;
				state.statusText = scope.$statusText;
			}
		}
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

	toggleMessages(n = null, parent = this.ownView) {
		const name = (n => {
			if (n >= 200 && n < 300) return "success";
			else if (n >= 400 && n < 500) return "warning";
			else if (n || n === 0) return "error";
		})(n);
		let statusMsg, classMsg;
		for (const node of parent.querySelectorAll(`[block-type="message"]`)) {
			const action = node.closest('[action]');
			if (action && action != this) continue;
			node.classList.remove('visible');
			const { status } = node.dataset;
			if (n && n == status) statusMsg = node;
			else if (name && node.classList.contains(name)) classMsg = node;
		}
		let node = statusMsg;
		if (classMsg) {
			if (node) classMsg.classList.remove('visible');
			else node = classMsg;
		}
		if (node) node.classList.add('visible');
		return node;
	}

	async #render(state, scope, data, collector) {
		const view = this.ownView;
		const tmpl = this.ownTpl.content.cloneNode(true);

		for (const node of tmpl.querySelectorAll('[block-id]')) {
			node.removeAttribute('block-id');
		}

		// allow sub-templates to merge current data

		for (const tpl of tmpl.querySelectorAll('template')) {
			if (tpl.parentNode.nodeName == this.nodeName || !tpl.content) continue;
			for (const node of tpl.content.querySelectorAll('[block-type="binding"],[block-type="block_binding"]')) {
				node.fuse(data, scope);
			}
			// get rid of block-id in those templates to avoid
			// pagecut from dying on them
			for (const node of tpl.content.querySelectorAll('[block-id]')) {
				node.removeAttribute('block-id');
			}
		}

		// we need to keep track of [start, end]
		// fetch needs to know if response offset is after stop
		// or before start
		const { offset, limit } = data;
		// TODO data.count is available, so just stop when offset + limit > count
		const count = data.items?.length ?? 0;
		let start = parseInt(this.dataset.start);
		if (Number.isNaN(start)) start = offset;
		let stop = parseInt(this.dataset.stop);
		if (Number.isNaN(stop)) stop = offset;

		let append = true;
		let replace = false;
		const auto = {
			name: "$items",
			enabled: Boolean(this.dataset.auto)
		};
		if (this.#auto) {
			auto.node = view.querySelector(`[data-auto-repeat="${auto.name}"]`);
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

		const el = {
			name: 'element_template_' + String(Math.round(Date.now() * Math.random())).slice(-6),
			dom: tmpl,
			hooks: {
				beforeEach(ctx, v, filter) {
					if (auto.enabled && filter[0] == "repeat" && filter.length <= 2) {
						filter.push('repeatPlacer');
					}
					return v;
				},
				afterAll(ctx, v) {
					collector.filter(ctx, v);
					return v;
				}
			},
			filters: {
				repeatPlacer(ctx, item, cursor, fragment) {
					const parent = cursor.parentNode;
					const name = ctx.expr.path[ctx.expr.path.length - 1];
					if (auto.name == name && parent.dataset && !parent.dataset.autoRepeat) {
						parent.dataset.autoRepeat = name;
					}
					if (replace || !auto.node || auto.name != name) {
						parent.insertBefore(fragment, cursor);
					} else if (append) {
						auto.node.appendChild(fragment);
					} else {
						auto.node.insertBefore(fragment, auto.node.firstChild);
					}
				}
			},
			contents: tmpl.querySelectorAll('[block-content]').map(node => {
				return {
					id: node.getAttribute('block-content'),
					nodes: 'block+'
				};
			})
		};
		for (const [key, val] of Object.entries(state.data.page ?? {})) {
			if (key.startsWith('$') && scope[key] == null) {
				console.warn("data key should not start with $", key);
				scope[key] = val;
			}
		}

		if (offset != null && limit != null) {
			Object.assign(this.dataset, { count, start, stop, limit });
		}
		const frag = await scope.render(data, el);
		if (collector.failed) scope.$status = 400;

		if (scope.$status != 200) {
			view.textContent = '';
			return frag;
		} else if (replace || !auto.node) {
			view.textContent = '';
			view.appendChild(frag);
			return view;
		} else {
			return view;
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

	#more() {
		this.#locked = true;
		if (this.#queue) this.#queue = this.#queue.then(() => {
			return Page.reload({vary: 'patch'});
		}).then(() => {
			this.#locked = false;
		});
	}

	setup({ scope }) {
		if (scope.$write) return;
		if (this.dataset.auto != "true") return;
		this.#queue = Promise.resolve();
		// FIXME when the list is not long enough, it does not trigger autoload
		this.#observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (!this.#locked) this.#more();
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

window.HTMLElementTemplate = HTMLElementTemplate;

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
	// FIXME this should use scope.$request ?
	for (const [key, val] of Object.entries(q)) {
		q[key] = typeof val == "string" ? val.fuse(data, scope) : val;
	}
	return this;
};


class QueryCollectorFilter {
	#missings = new Set();
	#query;
	#state;

	constructor(state, query = {}) {
		this.#query = query;
		this.#state = state;
	}
	filter(ctx, val) {
		const path = ctx.expr.path;
		if (path[0] != "$query") return val;
		const { query, vars } = this.#state;
		if (path.length > 1) {
			const key = path.slice(1).join('.');
			const undef = val === undefined;
			if (undef) {
				this.miss(key);
			} else {
				this.hit(key);
			}
			if (!vars[key]) vars[key] = !undef;
			this.#query[key] = val;
		} else if (typeof val == "string") {
			const isEnc = ctx.expr.filters[ctx.expr.filters.length - 1]?.[0] == "enc";
			const loc = Page.parse(isEnc ? '?' + decodeURIComponent(val) : val).query;
			for (const [key, val] of Object.entries(loc)) {
				if (query[key] === val) vars[key] = true;
				this.#query[key] = val;
			}
		}
		return val;
	}
	miss(key) {
		this.#missings.add(key);
	}
	hit(key) {
		this.#missings.delete(key);
	}
	get failed() {
		return this.#missings.size > 0;
	}
}

Page.constructor.prototype.collector = function (query) {
	return new QueryCollectorFilter(this, query);
};

Page.constructor.prototype.templatesQuery = function (node, collector) {
	const state = this;
	const params = node.getAttribute('parameters') || '';
	const $query = {};
	const scope = state.scope.copy();
	scope.$hooks = {
		...scope.$hooks,
		afterAll: function (ctx, val) {
			const { path } = ctx.expr;
			if (val === undefined) {
				// it is the duty of the fetch block to redirect 400 if needed
				collector?.miss(path[1]);
			} else if (path.length > 2) {
				console.error("parameters with unescaped key", path);
			} else if (path.length == 2) {
				const key = path[1];
				state.vars[key] = true;
				if (val != null) $query[key] = val;
			} else if (path[0] == "$pathname") {
				$query["$pathname"] = val;
			}
			return val;
		}
	};
	params.split(' ').map(str => {
		return `[${str}]`;
	}).join('').fuse({}, scope);
	return $query;
};

Page.define('element-template', HTMLElementTemplate);
