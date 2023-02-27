Pageboard.schemaHelpers.page = class PageHelper {
	static cache = {};

	constructor(input, opts, props, block) {
		this.opts = opts;
		this.input = input;
		input.type = "hidden";
		this.block = block;
		this.ignoreEvents = false;
	}

	init() {
		const input = this.input;
		const nodes = input.dom(`
			<div class="ui input"></div>
			<div class="ui items"></div>
			<div class="pager"></div>
		`);
		this.node = nodes.firstElementChild;
		this.container = this.node.nextElementSibling;

		if (this.opts.query) {
			const fieldset = input.dom('<fieldset class="field href page-href"></fieldset>');
			input.after(fieldset);
			fieldset.appendChild(nodes);
			const label = input.previousElementSibling;
			label.remove();
			fieldset.prepend(input.dom(`<legend>${label.innerHTML}</legend>`));
			const queryNodes = input.dom(`
				<label>[opts.title|or:Query]</label>
				<input is="element-input-map" title="[opts.description]">
			`).fuse({
				opts: this.opts
			}, {});
			this.inputMap = queryNodes.lastElementChild;
			this.node.after(...queryNodes.children);
			this.inputMap.addEventListener('change', (e) => {
				e.stopPropagation();
				this.searchStop();
			});
		} else {
			input.parentNode.classList.add('href', 'page-href');
			input.after(...nodes.children);
		}

		this.container.addEventListener('click', (e) => {
			if (e.target.closest('a')) e.preventDefault();
		}, true);

		const me = this;

		this.infinite = new (class extends window.Pageboard.InfiniteScroll {
			load(page) {
				const filter = {
					type: me.opts.type,
					...me.opts.filter
				};
				const text = me.uiInput.value;
				if (text && !text.startsWith('/')) filter.text = text;
				else filter.url = (text || '/').replace(/\s+/g, '-');
				filter.limit = 10;
				filter.offset = page * filter.limit;
				return Pageboard.uiLoad(
					this.node,
					Page.fetch('get', '/.api/pages', filter)
				).then(({ items: data }) => {
					if (!data || data.length == 0) return true;
					const node = me.container.ownerDocument.createElement('div');
					me.cache(data);
					me.renderList(data, node);
					me.container.append(...node.children);
				});
			}
		})(this.container.nextElementSibling);

		this.node.addEventListener('input', Page.debounce(e => {
			if (this.ignoreEvents) return;
			if (this.action == "search") {
				this.searchUpdate();
			} else if (!me.action) {
				this.write();
				this.start("search");
			}
		}, 100));

		this.node.addEventListener('focusin', (e) => {
			if (this.ignoreEvents) return;
			if (!e.target.matches('input')) return;
			if (!this.action) {
				if (this.input.value) {
					this.node.querySelector('input').select();
				} else {
					this.start('search');
				}
			}
		});

		this.node.addEventListener('click', (e) => {
			if (me.ignoreEvents) return;
			if (e.target.closest('input')) return;
			const actioner = e.target.closest('[data-action]');
			if (actioner) this.start(actioner.dataset.action);
			else this.stop(true);
		});

		this.container.addEventListener('click', (e) => {
			e.preventDefault();
			const item = e.target.closest('.item');
			if (!item) {
				e.stopPropagation();
				return;
			}
			if (this.action == 'search') {
				me.uiInput.value = item.getAttribute('href');
				this.stop();
			}
		});
	}

	destroy() {
		Pageboard.write.classList.remove('href');
	}

	update() {
		this.list = [];
		this.renderField();
		const val = this.input.value;
		if (val && !this.uiInput.value) {
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

	stop(cancel) {
		const prev = this.action;
		if (prev) {
			this[prev + 'Stop'](cancel);
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
		this.uiInput = this.node.querySelector('input');
		this.read();
	}

	cache(list) {
		const cache = PageHelper.cache;
		for (let i = 0; i < list.length; i++) {
			cache[list[i].url] = list[i];
		}
		return list;
	}

	searchStart() {
		this.initialValue = this.input.value;
		this.uiInput.value = '';
		this.uiInput.focus();
		Pageboard.write.classList.add('href');
		let parent = this.input.parentNode;
		while (parent) {
			parent = parent.parentNode.closest('.field,.fieldset');
			if (parent) parent.classList.add('href');
		}
		this.infinite.start();
		return this.searchUpdate();
	}

	searchUpdate() {
		if (!this.infinite.active) {
			this.searchStart();
		} else {
			this.infinite.stop();
			this.container.textContent = "";
			this.infinite.start();
		}
	}

	searchStop(cancel) {
		this.infinite.stop();
		Pageboard.write.classList.remove('href');
		let parent = this.input.parentNode;
		while (parent) {
			parent = parent.parentNode.closest('.field,.fieldset');
			if (parent) parent.classList.remove('href');
		}
		if (cancel) {
			this.uiInput.value = this.initialValue;
		}
		delete this.initialValue;
		this.write();
		this.container.textContent = "";
		Pageboard.trigger(this.input, 'change');
	}

	renderList(list, container) {
		if (list) this.list = list;
		else list = this.list;
		if (!list) throw new Error("Need a list to render");
		if (!container) container = this.container;
		const selected = this.input.value;
		if (list.rendered) {
			for (const child of container.childNodes) {
				if (child.nodeType != Node.ELEMENT_NODE) continue;
				const href = child.getAttribute('href');
				if (href == selected) child.classList.add('selected');
				else child.classList.remove('selected');
			}
			return;
		}
		list.rendered = true;
		container.textContent = '';
		for (const obj of list) {
			const item = this.renderItem(obj);
			if (selected && item.getAttribute('href') == selected) {
				item.classList.add('selected');
				container.insertBefore(item, container.firstChild);
			} else {
				container.appendChild(item);
			}
		}
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
		const loc = Page.parse(this.input.value);
		if (this.input.value.startsWith('/')) {
			this.uiInput.value = loc.pathname;
		} else {
			this.uiInput.value = "";
		}
		if (this.inputMap) this.inputMap.value = loc.query;
	}

	write() {
		this.input.value = this.format(this.uiInput.value, this.inputMap?.value);
	}

	format(pathname, query) {
		const list = [];
		if (query) for (const key of Object.keys(query)) {
			let aval = query[key];
			if (!Array.isArray(aval)) aval = [aval];
			for (const val of aval) {
				let item = encodeURIComponent(key);
				if (typeof val == "string" && val.fuse({ $query: {}, $body: {}, $response: {} }, {}) != val) {
					// do not escape val
					item += '=' + val;
				} else if (val != null) {
					item += '=' + encodeURIComponent(val);
				}
				list.push(item);
			}
		}
		let qstr = list.join('&');
		if (qstr.length) qstr = '?' + qstr;
		return (pathname || "") + qstr;
	}


};

