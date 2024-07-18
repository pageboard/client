Pageboard.schemaHelpers.href = class Href {
	static cache = {};

	static tplSize(size) {
		if (!size) return '';
		return ' (' + Pageboard.utils.PrettyBytes(size) + ')';
	}

	static tplDims(obj) {
		let str = "";
		if (obj.type == "video" || obj.type == "image") {
			if (obj.meta?.width) {
				str += `width ${obj.meta.width}px`;
			}
			if (obj.meta?.height) {
				str += `, height ${obj.meta.height}px`;
			}
		}
		if (obj.meta?.duration) {
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
		if (!url) return '';
		// keeps only path if same domain
		return Page.format(url);
	}

	constructor(input, opts, props) {
		this.trigger = Page.debounce(() => this.realTrigger(), 500);
		this.opts = opts;
		this.input = input;
		input.type = "hidden";
	}
	realTrigger() {
		const input = this.node.querySelector('input');
		if (input.value != this.input.value) {
			this.input.value = input.value;
			Pageboard.trigger(this.input, 'change');
			setTimeout(() => input.focus());
		}
	}

	init(block) {
		const input = this.input;
		input.parentNode.classList.add('href');

		input.insertAdjacentHTML('afterEnd', `<div class="ui input">
			<input class="search" type="text" />
			<div class="ui mini blue icon buttons">
				<div class="ui button" data-action="upload" title="Upload">
					<i class="upload icon"></i>
				</div>
				<div class="ui button" data-action="stop" title="Stop Search">
					<i class="close icon"></i>
				</div>
			</div>
		</div>
		<div class="ui items"></div>
		<div class="pager"></div>`);

		this.node = input.nextElementSibling;
		this.uiInput = this.node.querySelector('input');
		this.container = this.node.nextElementSibling;
		this.container.addEventListener('click', (e) => {
			if (e.target.closest('a')) e.preventDefault();
		}, true);

		const me = this;
		this.infinite = new (class extends window.Pageboard.InfiniteScroll {
			load(page) {
				let text = me.uiInput.value;
				let url;
				if (text.startsWith('#') || text.startsWith('/')) {
					url = Href.normUrl(text);
					if (text.endsWith('#')) url = url + '#';
					text = null;
				}
				const filter = {
					text,
					url,
					...me.opts.filter
				};
				filter.limit = 10;
				filter.offset = page * filter.limit;
				return Pageboard.uiLoad(
					this.node,
					Page.fetch('get', '/@api/href/search', filter)
				).then(({ hrefs }) => {
					if (!hrefs?.length) return true;
					me.cache(hrefs);
					me.renderList(hrefs, true);
				});
			}
		})(this.container.nextElementSibling);

		this.node.addEventListener('input', (e) => {
			this.searchUpdate();
		});

		this.node.addEventListener('paste', (e) => {
			const val = e.clipboardData.getData('text/plain');
			if (!val) return;
			if (val.startsWith('/') || /^(http:|https:)?\/\//.test(val)) {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.uiInput.blur();
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
			if (this.infinite.active) {
				if (href == input.value) input.value = "";
				else input.value = href;
				const data = Href.cache[href];
				if (data && !Pageboard.hrefs[href]) {
					Pageboard.hrefs[href] = {
						mime: data.mime,
						...data.meta
					};
				}
				Pageboard.trigger(input, 'change');
				this.searchStop();
			} else {
				this.searchStart();
			}
		});
	}

	destroy() {
		for (const node of this.input.closest('.href').querySelectorAll('.ui.input,.pager, .ui.items')) {
			node.remove();
		}
		Pageboard.write.classList.remove('href');
	}

	update() {
		if (!this.list) this.list = [];
		this.node.querySelector(`[data-action="upload"]`).classList.toggle('hidden', Boolean(this.opts.readOnly));
		const val = this.input.value;
		if (val && !this.uiInput.value) {
			this.uiInput.value = val;
		}
		if (val && !this.infinite.active) {
			this.get(val).then(this.cache).then(list => {
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
		list.forEach(obj => {
			const href = Href.normUrl(obj.url);
			map[href] = obj;
			if (!hrefs[href]) {
				hrefs[href] = {
					mime: obj.mime,
					...obj.meta
				};
			}
		});
		return result;
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
			for (const node of this.container.querySelectorAll('.item:not(.selected)')) {
				node.remove();
			}
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
			this.input.value = this.initialValue;
		}
		delete this.initialValue;
		this.set(this.input.value);
		Pageboard.trigger(this.input, 'change');
	}

	set(str) {
		if (!str) {
			this.list = [];
		} else {
			str = this.constructor.normUrl(str);
			if (this.constructor.cache[str]) {
				if (this.uiInput.value != str) this.uiInput.value = str;
				this.list = [this.constructor.cache[str]];
			}
		}
		this.renderList(this.list);
	}

	async uploadStart() {
		// TODO is it possible to upload multiple files in separate steps
		// to avoid reaching the max body server upload limit ?
		const input = document.createElement('input');
		input.type = "file";
		input.multiple = true;
		const defer = new Deferred();
		input.addEventListener('change', () => {
			const fd = new FormData();
			if (input.files.length == 0) return defer.resolve();
			for (let i = 0; i < input.files.length; i++) {
				fd.append("files", input.files[i]);
			}
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/@api/upload/add", true);
			xhr.setRequestHeader('Accept', "application/json; q=1.0");
			const tracker = this.uploading();
			tracker(0);

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					let percent = Math.round((e.loaded * 100) / e.total);
					if (percent >= 100) percent = 99; // only load event can reach 100
					tracker(percent);
				}
			});

			xhr.addEventListener('load', () => {
				tracker(100);
				let response;
				try {
					response = JSON.parse(xhr.responseText);
				} catch (ex) {
					defer.reject(ex);
					return;
				}
				defer.resolve(response);
			});

			xhr.addEventListener('error', (e) => {
				if (xhr.status == 0) return tracker("Connection error");
				const msg = xhr.statusText || "Connection error";
				const err = new Error(msg);
				err.status = xhr.status;
				tracker(msg + '(' + xhr.status + ')');
				defer.reject(err);
			});

			xhr.send(fd);
		});
		input.value = null;
		input.click();

		const obj = await defer;
		const hrefs = obj?.hrefs ?? [];
		for (const item of hrefs) {
			await this.insert(item);
		}
		if (hrefs.length == 1) Pageboard.trigger(this.input, 'change');
	}

	uploadStop() { }

	uploading() {
		const root = Pageboard.notify.dom();
		const progress = root.dom(`<div class="ui blue attached progress"><div class="bar"></div></div>`);
		root.appendChild(progress);
		progress.animate([{ width: 0 }], { duration: 0 });

		const finished = false;
		return function (percent) {
			if (finished) return;
			if (typeof percent == "number") {
				progress.animate([{ width: percent + '%' }], { duration: 500 });
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

	async get(url) {
		const { href } = Href.cache[Href.normUrl(url)]
			?? await Pageboard.uiLoad(this.node, Page.fetch('get', '/@api/href/get', { url }));
		return href;
	}

	async insert(item) {
		if (typeof item == "string") {
			item = (await Pageboard.uiLoad(
				this.node.querySelector(`[data-action]`),
				Page.fetch('post', '/@api/href/add', {
					url: Href.normUrl(item)
				})
			)).href;
		}
		this.cache([item]);
		this.input.value = item.url;
		this.searchStop();
	}

	renderList(list, append) {
		if (list) this.list = list;
		else list = this.list;

		const { container } = this;


		if (!append) container.textContent = '';

		for (const obj of list) {
			container.appendChild(this.renderItem(obj));
		}

		container.className = `ui items ${this.opts.display || ''}`;

		const selected = Href.normUrl(this.input.value);
		const active = selected && container.querySelector(`a.item[href="${selected}"]`);
		if (active) active.classList.add('selected');
	}

	renderItem(obj) {
		const dims = Href.tplDims(obj);

		const item = document.dom(`<a href="[url|as:url]" class="item">
			<div class="content">
				<div class="ui tiny header">[title|or:-]</div>
			</div>
		</a>`).fuse(obj, {});
		const content = item.firstElementChild;

		if (obj.meta) content.appendChild(item.dom(`<div class="left floated meta">
			${obj.mime.split(';').shift()}<em>${Href.tplSize(obj.meta.size)}</em><br>
			${dims ? dims + '<br>' : ''}
			${Pageboard.utils.durationFormat(obj.updated_at)}
			${obj.type == 'link' ? ('<br><span class="line">' + obj.url + '</span>') : ''}
		</div>
		${Href.tplPreview(obj.preview)}`));
		if (obj.icon) {
			content.appendChild(item.dom(`<img src="${obj.icon}" class="ui avatar icon image" />`));
		}
		return item;
	}
};
