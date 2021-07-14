/* global $ */

Pageboard.schemaHelpers.href = class Href {
	static cache = {};

	static tplSize(size) {
		if (!size) return '';
		return ' (' + Pageboard.utils.PrettyBytes(size) + ')';
	}

	static tplDims(obj) {
		let str = "";
		if (obj.type == "video" || obj.type == "image") {
			if (obj.meta.width) {
				str += `width ${obj.meta.width}px`;
			}
			if (obj.meta.height) {
				str += `, height ${obj.meta.height}px`;
			}
		}
		if (obj.meta.duration) {
			str += ` - ${obj.meta.duration}`;
		}
		return str;
	}

	static tplPreview(preview) {
		if (!preview) return '';
		preview = document.dom(preview);
		if (preview.nodeType != Node.ELEMENT_NODE) return preview;
		if (preview.matches('img')) {
			preview.className = "ui tiny image";
			return `<div class="thumbnail">${preview.outerHTML}</div>`;
		} else {
			console.warn("fixme, render preview", preview);
		}
	}

	static normUrl(url) {
		// keeps only path if same domain
		return Page.format(Page.parse(url));
	}

	constructor(input, opts, props) {
		this.trigger = Pageboard.debounce(this.realTrigger, 500);
		this.renderList = this.renderList.bind(this);
		this.cache = this.cache.bind(this);
		this.set = this.set.bind(this);
		this.opts = opts;
		this.input = input;
		input.hidden = true;
	}
	realTrigger() {
		const input = this.node.querySelector('input');
		if (input.value != this.input.value) {
			this.input.value = input.value;
			Pageboard.trigger(this.input, 'change');
			setTimeout(function() {
				input.focus();
			});
		}
	}

	init(block) {
		const input = this.input;
		input.parentNode.classList.add('href');

		input.insertAdjacentHTML('afterEnd', `<div class="ui input">
			<input name="$search" class="search" type="text" placeholder="Search or Paste..." />
			<div class="ui blue icon buttons">
				<div class="ui button" data-action="upload" title="Upload">
					<i class="upload icon"></i>
				</div>
				<div class="ui button" data-action="stop" title="Stop Search">
					<i class="close icon"></i>
				</div>
			</div>
		</div>
		<div class="ui items"></div>`);

		this.node = input.nextElementSibling;
		this.uiInput = this.node.querySelector('input');
		this.container = this.node.nextElementSibling;
		this.container.addEventListener('click', function(e) {
			if (e.target.closest('a')) e.preventDefault();
		}, true);

		this.node.addEventListener('input', (e) => {
			this.searchUpdate();
		});

		this.node.addEventListener('paste', (e) => {
			const val = e.clipboardData.getData('text/plain');
			if (!val) return;
			if (val.startsWith('/') || /^(http:|https:)?\/\//.test(val)) {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.insert(val);
				Pageboard.trigger(this.input, 'change');
			} else {
				// let input listener handle it
			}
		});

		this.node.addEventListener('focusin', (e) => {
			if (this.input.value) {
				this.uiInput.select();
			}
			this.searchUpdate();
		});

		this.node.addEventListener('click', (e) => {
			const actioner = e.target.closest('[data-action]');
			if (!actioner) return;
			if (actioner.dataset.action == "upload") this.uploadStart();
			else if (actioner.dataset.action == "stop") this.searchStop(true);
		});

		this.container.addEventListener('click', (e) => {
			e.preventDefault();
			const item = e.target.closest('.item');
			if (!item) {
				e.stopPropagation();
				return;
			}
			const href = item.getAttribute('href');
			const remove = e.target.closest('[data-action="remove"]');
			if (remove) {
				e.stopPropagation();
				return Pageboard.uiLoad(remove, this.remove(Href.cache[href].url)).then(() => {
					this.renderList();
					Pageboard.scrollbar.update();
				});
			} else {
				if (href == input.value) {
					this.searchStop();
				} else {
					input.value = href;
					const data = Href.cache[href];
					if (data && !Pageboard.hrefs[href]) {
						Pageboard.hrefs[href] = Object.assign({
							mime: data.mime
						}, data.meta);
					}
					Pageboard.trigger(input, 'change');
				}
			}
		});
	}

	destroy() {
		Pageboard.write.classList.remove('href');
	}

	update() {
		if (!this.list) this.list = [];
		this.node.querySelector(`[data-action="upload"]`).classList.toggle('hidden', !!this.opts.readOnly);
		const val = this.input.value;
		if (val && !this.uiInput.value) {
			this.uiInput.value = val;
		}
		if (val && !this.infinite) {
			this.get(val).then(this.cache).then((list) => {
				this.set(val);
			});
		} else {
			this.renderList();
		}
	}

	cache(result) {
		const map = Href.cache;
		const hrefs = Pageboard.hrefs;
		let list = result;
		if (list == null) return;
		if (!Array.isArray(list)) list = [list];
		list.forEach((obj) => {
			const href = Href.normUrl(obj.url);
			map[href] = obj;
			if (!hrefs[href]) {
				hrefs[href] = Object.assign({
					mime: obj.mime
				}, obj.meta);
			}
		});
		return result;
	}

	searchStart() {
		const me = this;
		this.initialValue = this.input.value;
		this.uiInput.value = '';
		this.uiInput.focus();
		this.lastPageIndex = Infinity;
		this.first = true;
		this.infinite = new window.InfiniteScroll(this.container, {
			path: function() {
				let text = me.first ? '' : me.uiInput.value;
				let url;
				if (text.startsWith('#') || text.startsWith('/')) {
					url = Href.normUrl(text);
					if (text.endsWith('#')) url = url + '#';
					text = null;
				}
				const filter = Object.assign({
					text: text,
					url: url
				}, me.opts.filter);
				filter.limit = 10;
				if (me.lastPageIndex < this.pageIndex) return;
				filter.offset = (this.pageIndex - 1) * filter.limit;
				return Page.format({
					pathname: '/.api/hrefs',
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
		let parent = this.input.parentNode;
		while (parent) {
			parent = parent.parentNode.closest('.field,.fieldset');
			if (parent) parent.classList.add('href');
		}
		return this.searchUpdate();
	}

	searchUpdate() {
		if (!this.infinite) return this.searchStart();
		this.container.textContent = "";
		this.infinite.pageIndex = 1;
		const p = this.infinite.loadNextPage();
		if (p) p.then(({ body }) => {
			this.first = false;
			const data = JSON.parse(body).data;
			if (data.length == 0) this.lastPageIndex = this.infinite.pageIndex;
			const node = this.container.ownerDocument.createElement('div');
			this.cache(data);
			this.renderList(data, node);
			this.infinite.appendItems(Array.from(node.children));
		});
	}

	searchStop(cancel) {
		if (this.infinite) {
			this.infinite.destroy();
			delete this.infinite;
		}
		Pageboard.write.classList.remove('href');
		let parent = this.input.parentNode;
		while (parent) {
			parent = parent.parentNode.closest('.field,.fieldset');
			if (parent) parent.classList.remove('href');
		}
		if (cancel) {
			this.input.value = this.initialValue;
		}
		delete this.initialValue;
		this.set(this.input.value);
		Pageboard.scrollbar.update();
		Pageboard.trigger(this.input, 'change');
	}

	set(str) {
		if (!str) {
			this.list = [];
		} else {
			str = Href.normUrl(str);
			if (Href.cache[str]) {
				if (this.uiInput.value != str) this.uiInput.value = str;
				this.list = [Href.cache[str]];
			}
		}
		this.renderList(this.list);
	}

	uploadStart() {
		// TODO is it possible to upload multiple files in separate steps
		// to avoid reaching the max body server upload limit ?
		const input = document.createElement('input');
		input.type = "file";
		input.multiple = true;
		const me = this;
		return new Promise(function(resolve, reject) {
			input.addEventListener('change', function() {
				const fd = new FormData();
				if (input.files.length == 0) return resolve();
				for (let i = 0; i < input.files.length; i++) {
					fd.append("files", input.files[i]);
				}
				const xhr = new XMLHttpRequest();
				xhr.open("POST", "/.api/upload", true);
				xhr.setRequestHeader('Accept', "application/json; q=1.0");
				const tracker = me.uploading();
				tracker(0);

				xhr.upload.addEventListener("progress", function(e) {
					if (e.lengthComputable) {
						let percent = Math.round((e.loaded * 100) / e.total);
						if (percent >= 100) percent = 99; // only load event can reach 100
						tracker(percent);
					}
				});

				xhr.addEventListener('load', function() {
					tracker(100);
					let response;
					try {
						response = JSON.parse(xhr.responseText);
					} catch(ex) {
						reject(ex);
						return;
					}
					resolve(response);
				});

				xhr.addEventListener('error', function(e) {
					if (xhr.status == 0) return tracker("Connection error");
					const msg = xhr.statusText || "Connection error";
					const err = new Error(msg);
					err.statusCode = xhr.status;
					tracker(msg + '(' + xhr.status + ')');
					reject(err);
				});

				xhr.send(fd);
			});
			input.value = null;
			input.click();
		}).then(function(obj) {
			const files = Array.isArray(obj) ? obj : (obj && obj.items || []);
			let p = Promise.resolve();
			files.forEach(function(file) {
				p = p.then(function() {
					return me.insert(file);
				});
			});
			return p.then(function() {
				if (files.length == 1) Pageboard.trigger(me.input, 'change');
			});
		});
	}

	uploadStop() {}

	uploading() {
		const root = Pageboard.notify.dom();
		const progress = root.dom(`<div class="ui blue attached progress"><div class="bar"></div></div>`);
		root.appendChild(progress);
		const $node = $(progress).progress({
			percent: 0
		});

		const finished = false;
		return function(percent) {
			if (finished) return;
			if (typeof percent == "number") {
				$node.progress({percent: percent});
				if (percent < 100) return;
			} else {
				Pageboard.notify("Upload failed", {
					type: 'negative',
					text: percent
				});
			}
			progress.remove();
		};
	}

	remove(href) {
		const me = this;
		return Pageboard.uiLoad(this.node, Pageboard.fetch('delete', '/.api/href', {
			url: href
		})).then(function(obj) {
			me.cache([obj]);
			me.list = me.list.filter(function(obj) {
				return obj.url != href;
			});
		});
	}

	get(href) {
		const obj = Href.cache[Href.normUrl(href)];
		if (obj) return Promise.resolve(obj);
		return Pageboard.uiLoad(this.node, Pageboard.fetch('get', '/.api/hrefs', {
			url: href
		})).then(function(obj) {
			return obj.data;
		});
	}

	insert(url) {
		url = Href.normUrl(url);
		return Pageboard.uiLoad(
			this.node.querySelector(`[data-action]`),
			Pageboard.fetch('post', '/.api/href', {
				url: url
			})
		).then((result) => {
			this.cache([result]);
			this.input.value = result.url;
			this.list.unshift(result);
			this.list.rendered = false;
			this.renderList();
		});
	}

	renderList(list, container) {
		if (list) this.list = list;
		else list = this.list;
		if (!list) throw new Error("Need a list to render");
		if (!container) container = this.container;
		let selected = this.input.value;
		if (selected) selected = Href.normUrl(selected);
		if (list.rendered) {
			container.childNodes.forEach(function(child) {
				if (child.nodeType != Node.ELEMENT_NODE) return;
				const href = child.getAttribute('href');
				if (href == selected) child.classList.add('selected');
				else child.classList.remove('selected');
			});
			return;
		}
		list.rendered = true;
		container.textContent = ' ';
		list.forEach(function(obj) {
			const item = this.renderItem(obj);
			if (selected && item.getAttribute('href') == selected) {
				item.classList.add('selected');
				container.insertBefore(item, container.firstChild);
			} else {
				container.appendChild(item);
			}
		}, this);
		container.className = `ui items ${this.opts.display || ''}`;
	}

	renderItem(obj) {
		const dims = Href.tplDims(obj);

		const item = document.dom(`<a href="${Href.normUrl(obj.url)}" class="item">
			<div class="content">
				<div class="ui tiny header">
					${obj.title || '-'}
					<div class="ui pinned right compact circular large icon button" data-action="remove">
						<i class="icon ban"></i>
					</div>
				</div>
			</div>
		</a>`);
		const content = item.firstElementChild;

		content.appendChild(item.dom(`<div class="left floated meta">
			${obj.mime.split(';').shift()}<em>${Href.tplSize(obj.meta.size)}</em><br>
			${dims ? dims + '<br>' : ''}
			${Pageboard.utils.durationFormat(obj.updated_at)}
			${obj.type == 'link' ? ('<br><span class="line">' + obj.url + '</span>') : ''}
		</div>
		${Href.tplPreview(obj.preview)}`));
		if (obj.icon) {
			content.appendChild(item.dom(`<img src="${obj.icon}" class="ui avatar icon image" />`));
		}

		if (!obj.visible || this.opts.readOnly) {
			item.querySelector('[data-action="remove"]').remove();
		}
		return item;
	}
};
