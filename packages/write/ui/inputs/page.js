Pageboard.schemaHelpers.page = class PageHelper {
	static cache = {};

	constructor(input, opts, props, block) {
		this.renderList = this.renderList.bind(this);
		this.cache = this.cache.bind(this);
		this.opts = opts;
		this.input = input;
		input.type = "hidden";
		this.block = block;
		this.ignoreEvents = false;
	}

	init() {
		const input = this.input;

		let nodes = input.dom(`<div class="ui input"></div>
		<div class="ui items"></div>`);
		this.container = nodes.lastElementChild;
		this.node = this.container.previousElementSibling;

		if (this.opts.query) {
			const fieldset = input.dom('<fieldset class="field href page-href"></fieldset>');
			input.after(fieldset);
			fieldset.appendChild(nodes);
			const label = input.previousElementSibling;
			label.remove();
			fieldset.prepend(input.dom(`<legend>${label.innerHTML}</legend>`));
			nodes = input.dom(`
			<label>[opts.title|or:Query]</label>
			<input-map title="[opts.description]"></input-map>
		`).fuse({
				opts: this.opts
			}, {});
			this.inputMap = nodes.lastElementChild;
			this.node.after(...nodes.children);
			this.inputMap.addEventListener('change', function (e) {
				e.stopPropagation();
				this.searchStop();
			}.bind(this));
		} else {
			input.parentNode.classList.add('href', 'page-href');
			input.after(...nodes.children);
		}

		this.container.addEventListener('click', function (e) {
			if (e.target.closest('a')) e.preventDefault();
		}, true);

		const me = this;

		this.node.addEventListener('input', Pageboard.debounce(function (e) {
			if (me.ignoreEvents) return;
			if (me.action == "search") {
				me.searchUpdate();
			} else if (!me.action) {
				me.write();
				me.start("search");
			}
		}, 100));

		this.node.addEventListener('focusin', function (e) {
			if (me.ignoreEvents) return;
			if (!e.target.matches('input')) return;
			if (!me.action) {
				if (me.input.value) {
					me.node.querySelector('input').select();
				} else {
					me.start('search');
				}
			}
		});

		this.node.addEventListener('click', function (e) {
			if (me.ignoreEvents) return;
			if (e.target.closest('input')) return;
			const actioner = e.target.closest('[data-action]');
			if (actioner) this.start(actioner.dataset.action);
			else this.stop();
		}.bind(this));

		this.container.addEventListener('click', function (e) {
			e.preventDefault();
			const item = e.target.closest('.item');
			if (!item) {
				e.stopPropagation();
				return;
			}
			if (this.action == 'search') {
				me.fakeInput.value = item.getAttribute('href');
				this.stop();
			}
		}.bind(this));
	}

	destroy() {
		Pageboard.write.classList.remove('href');
	}

	update() {
		this.list = [];
		this.renderField();
		const val = this.input.value;
		if (val && !this.fakeInput.value) {
			this.read();
		}
		this.renderList();
	}

	start(action) {
		if (this.action == action) return;
		this.ignoreEvents = true;
		this.stop();
		this.action = action;
		this.renderField();
		this[action + 'Start']();
		this.ignoreEvents = false;
	}

	stop() {
		const prev = this.action;
		if (prev) {
			this[prev + 'Stop']();
			this.action = null;
		}
		this.renderField();
	}

	renderField() {
		let content;
		const title = this.input.title || "";
		switch (this.action) {
			case "search":
				content = document.dom(`<input class="search" type="text" placeholder="${title}" />
			<div class="ui blue icon buttons">
				<div class="ui active button" title="Stop">
					<i class="close icon"></i>
				</div>
			</div>`);
				break;
			default:
				content = document.dom(`<input class="search" type="text" placeholder="${title}" />
			<div class="ui blue icon buttons">
				<div class="ui button" data-action="search" title="Search">
					<i class="search icon"></i>
				</div>
			</div>`);
		}
		this.node.textContent = '';
		this.node.appendChild(content);
		this.fakeInput = this.node.querySelector('input');
		this.read();
	}

	cache(list) {
		const cache = PageHelper.cache;
		for (let i = 0; i < list.length; i++) {
			cache[list[i].url] = list[i];
		}
		return list;
	}

	searchStart(same) {
		if (same) {
			return;
		}
		const me = this;
		const input = this.fakeInput;
		setTimeout(function () {
			input.focus();
		});
		this.infinite = new window.InfiniteScroll(this.container, {
			path: function () {
				const limit = me.opts.limit || 10;
				const filter = {
					type: me.opts.type,
					limit: limit,
					offset: (this.pageIndex - 1) * limit
				};
				const text = me.fakeInput.value;
				if (text && !text.startsWith('/')) filter.text = text;
				else filter.url = (text || '/').replace(/\s+/g, '-');
				return Page.format({
					pathname: '/.api/pages',
					query: filter
				});
			},
			responseType: 'text',
			domParseResponse: false,
			scrollThreshold: 400,
			elementScroll: Pageboard.write,
			loadOnScroll: true,
			history: false,
			debug: false
		});
		Pageboard.write.classList.add('href');
		this.input.closest('form').classList.add('href');
		let parent = this.input;
		while ((parent = parent.parentNode.closest('fieldset,.fieldset'))) {
			parent.classList.add('href');
		}
		return this.searchUpdate();
	}

	searchUpdate() {
		this.container.textContent = "";
		this.infinite.pageIndex = 1;
		const p = this.infinite.loadNextPage();
		if (p) p.then(res => {
			if (!res || !res.body) return;
			const data = JSON.parse(res.body).items;
			const node = this.container.ownerDocument.createElement('div');
			this.cache(data);
			this.renderList(data, node);
			this.infinite.appendItems(Array.from(node.children));
		});
	}

	searchStop() {
		if (this.infinite) {
			this.infinite.destroy();
			delete this.infinite;
		}
		this.container.textContent = '';
		Pageboard.write.classList.remove('href');
		this.input.closest('form').classList.remove('href');
		let parent = this.input;
		while ((parent = parent.parentNode.closest('fieldset,.fieldset'))) {
			parent.classList.remove('href');
		}
		this.write();
		Pageboard.trigger(this.input, 'change');
	}

	get(href) {
		const urlObj = Page.parse(href);
		const obj = PageHelper.cache[urlObj.pathname];
		if (obj) return Promise.resolve(obj);
		return Pageboard.uiLoad(this.node, Pageboard.fetch('get', '/.api/pages', {
			url: urlObj.pathname,
			type: this.opts.type
		})).then(function (obj) {
			return obj.items;
		});
	}

	renderList(list, container) {
		if (list) this.list = list;
		else list = this.list;
		if (!list) throw new Error("Need a list to render");
		if (!container) container = this.container;
		const selected = this.input.value;
		if (list.rendered) {
			container.childNodes.forEach(function (child) {
				if (child.nodeType != Node.ELEMENT_NODE) return;
				const href = child.getAttribute('href');
				if (href == selected) child.classList.add('selected');
				else child.classList.remove('selected');
			});
			return;
		}
		list.rendered = true;
		container.textContent = '';
		list.forEach(function (obj) {
			const item = this.renderItem(obj);
			if (selected && item.getAttribute('href') == selected) {
				item.classList.add('selected');
				container.insertBefore(item, container.firstChild);
			} else {
				container.appendChild(item);
			}
		}, this);
	}

	renderItem(block) {
		return document.dom(`<a href="${block.data.url}" class="item">
		<div class="content">
			<div class="ui tiny header">
				${block.data.title}
			</div>
			<div class="left floated meta">
				${Pageboard.utils.durationFormat(block.updated_at || block.data.updated_at)}
				<br><span class="line">${block.data.url}</span>
			</div>
		</div>
	</a>`);
	}

	read() {
		const val = Page.parse(this.input.value);
		if (this.input.value.startsWith('/')) {
			this.fakeInput.value = val.pathname;
		} else {
			this.fakeInput.value = "";
		}
		if (this.inputMap) this.inputMap.value = val.query;
	}

	write() {
		this.input.value = this.format(this.fakeInput.value, this.inputMap?.value);
	}

	format(pathname, query) {
		const list = [];
		if (query) Object.keys(query).forEach(function (key) {
			let val = query[key];
			if (!Array.isArray(val)) val = [val];
			val.forEach(function (val) {
				let item = encodeURIComponent(key);
				if (typeof val == "string" && val.fuse({ $query: {}, $body: {}, $response: {} }, {}) != val) {
					// do not escape val
					item += '=' + val;
				} else if (val != null) {
					item += '=' + encodeURIComponent(val);
				}
				list.push(item);
			});
		});
		let qstr = list.join('&');
		if (qstr.length) qstr = '?' + qstr;
		return (pathname || "") + qstr;
	}


};

