class HTMLElementTemplate extends Page.Element {
	loading = false;
	#observer;
	#queue;
	#locked;

	#autoOffset(state) {
		const { offset, offsetName, auto } = this.dataset;
		if (auto == "true" && !(offsetName in state.query) && offset != 'Infinity') {
			return parseInt(offset) || 0;
		}
	}

	async patch(state) {
		this.ownTpl.prerender();
		if (state.scope.$write || this.loading) return;
		if (this.closest('[block-content="template"]')) {
			console.warn("patch within template shouldn't happen");
			return;
		}

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
			const offset = this.#autoOffset(state);
			if (offset != null) {
				const { offsetName } = this.dataset;
				state.ivars.add(offsetName);
				request[offsetName] = offset;
			}
			this.loading = true;
			this.classList.add('loading');
			response = await state.fetch('get', action, request);
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

		const { offset, limit, count } = data;
		const initial = this.#autoOffset(state);

		let append = true;
		let replace = false;
		const auto = {
			name: "$items",
			enabled: Boolean(this.dataset.auto)
		};
		if (initial != null) {
			auto.node = view.querySelector(`[data-auto-repeat="${auto.name}"]`);
			if (offset <= initial) {
				append = false;
			} else if (offset > initial + limit) {
				replace = true;
			}
		} else {
			replace = true;
		}
		if (offset + limit < count) {
			this.dataset.offset = offset + limit;
		} else {
			this.dataset.offset = Infinity;
		}

		const el = {
			name: 'element_template_' + String(Math.round(Date.now() * Math.random())).slice(-6),
			dom: tmpl,
			hooks: {
				before: {
					repeat(ctx, v, args) {
						if (auto.enabled && args.length <= 2) {
							args.push('repeatPlacer');
						}
					}
				},
				afterAll(ctx, v) {
					collector.filter(ctx, v);
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
		for (const [key, val] of Object.entries(state.data.response ?? {})) {
			if (key.startsWith('$') && scope[key] == null) {
				console.warn("data key should not start with $", key);
				scope[key] = val;
			}
		}

		const frag = scope.render(data, el);
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
		if (!this.#queue) return;
		this.#locked = true;
		this.#queue = this.#queue.then(async () => {
			await Page.reload({ vary: 'patch' });
			this.#locked = false;
		});
	}

	setup(state) {
		if (state.scope.$write) return;
		if (this.#autoOffset(state) == null) return;
		this.#queue = Promise.resolve();
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
			const loc = Page.parse(val).query;
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
			} else if (path.length == 1 && path[0].startsWith('$')) {
				$query[path[0]] = val;
			}
		}
	};
	params.split(' ').map(str => {
		return `[${str}]`;
	}).join('').fuse({}, scope);
	return $query;
};

Page.define('element-template', HTMLElementTemplate);
