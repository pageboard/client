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
		// FIXME remove this heresy
		const disabled = (this.getAttribute('disabled') || '').fuse({}, state.scope);
		// end of heresy
		let action = disabled ? null : this.getAttribute('action');
		const request = state.templatesQuery(this);
		if (request == null) action = null; // missing parameters

		// redirections are only allowed to use collected query params

		this.toggleMessages();
		const scope = state.scope.copy();

		let response = {};
		if (action) try {
			if (this.#auto) {
				request[this.dataset.pagination] = this.dataset.stop;
			}
			request.lang ??= scope.$lang;
			response = await state.fetch('get', action, request);
			this.loading = true;
			this.classList.add('loading');
			await scope.import(response);
			await scope.bundles(response);
		} catch (err) {
			scope.$status = -1;
			// eslint-disable-next-line no-console
			console.error("Error building", err);
		} finally {
			this.classList.remove('loading');
			this.loading = false;
		}
		// TODO injected bundles cannot register scope.$filters before render
		this.#render(state, scope, response);
		if (scope.$status == null) return;
		const redirect = this.getRedirect(scope.$status);
		if (!redirect) {
			this.toggleMessages(scope.$status);
			if (scope.$status > (state.status || 0)) {
				state.status = scope.$status;
				state.statusText = scope.$statusText;
			}
			return;
		}
		scope.$request = request;
		scope.$response = response;
		const loc = Page.parse(redirect).fuse({}, scope);
		state.status = 301;
		state.statusText = `Form Redirection ${scope.$status}`;
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

	#render(state, scope, data) {
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

		const collector = state.collector();

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
		const frag = scope.render(data, el);

		if (Object.keys(collector.missings).length) {
			state.statusText = `Missing Query Parameters`;
			state.status = 400;
			// eslint-disable-next-line no-console
			console.warn(state.statusText, Object.keys(collector.missings).join(', '));
			const msg = this.toggleMessages(state.status, frag);
			view.textContent = '';
			if (msg) view.appendChild(msg);
		} else if (replace || !auto.node) {
			view.textContent = '';
			view.appendChild(frag);
		} else {
			// do nothing
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
			if (this.disabled) return;
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
	for (const [key, val] of Object.entries(q)) {
		if (scope.$request && String(val).includes('$query')) {
			console.error("FIXME: this should use $request, not $query", key, val);
		}
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
				console.info("expression needs", key, ":", ctx.expr.toString());
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
			const { path } = ctx.expr;
			if (val === undefined) {
				// it is the duty of the fetch block to redirect 400 if needed
				missings++;
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
	if (missings > 0) return null;
	else return $query;
};

Page.define('element-template', HTMLElementTemplate);
