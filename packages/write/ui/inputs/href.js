/* global $ */
(function(Pageboard) {
Pageboard.schemaHelpers.href = Href;

Href.cache = {};

function Href(input, opts, props) {
	this.trigger = Pageboard.debounce(this.realTrigger, 500);
	this.renderList = this.renderList.bind(this);
	this.cache = this.cache.bind(this);
	this.set = this.set.bind(this);
	this.opts = opts;
	this.input = input;
	input.hidden = true;
}

Href.prototype.realTrigger = function() {
	var input = this.node.querySelector('input');
	if (input.value != this.input.value) {
		this.input.value = input.value;
		Pageboard.trigger(this.input, 'change');
		setTimeout(function() {
			input.focus();
		});
	}
};

Href.prototype.init = function(block) {
	var input = this.input;
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
		var val = e.clipboardData.getData('text/plain');
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
		var actioner = e.target.closest('[data-action]');
		if (!actioner) return;
		if (actioner.dataset.action == "upload") this.uploadStart();
		else if (actioner.dataset.action == "stop") this.searchStop(true);
	});

	this.container.addEventListener('click', (e) => {
		e.preventDefault();
		var item = e.target.closest('.item');
		if (!item) {
			e.stopPropagation();
			return;
		}
		var href = item.getAttribute('href');
		var remove = e.target.closest('[data-action="remove"]');
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
				var data = Href.cache[href];
				if (data && !Pageboard.hrefs[href]) {
					Pageboard.hrefs[href] = Object.assign({
						mime: data.mime
					}, data.meta);
				}
				Pageboard.trigger(input, 'change');
			}
		}
	});
};

Href.prototype.destroy = function() {
	Pageboard.write.classList.remove('href');
};

Href.prototype.update = function() {
	if (!this.list) this.list = [];
	this.node.querySelector(`[data-action="upload"]`).classList.toggle('hidden', !!this.opts.readOnly);
	var val = this.input.value;
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
};

Href.prototype.cache = function(result) {
	var map = Href.cache;
	var hrefs = Pageboard.hrefs;
	var list = result;
	if (list == null) return;
	if (!Array.isArray(list)) list = [list];
	list.forEach((obj) => {
		var href = normUrl(obj.url);
		map[href] = obj;
		if (!hrefs[href]) {
			hrefs[href] = Object.assign({
				mime: obj.mime
			}, obj.meta);
		}
	});
	return result;
};

Href.prototype.searchStart = function() {
	var me = this;
	this.initialValue = this.input.value;
	this.uiInput.value = '';
	this.uiInput.focus();
	this.lastPageIndex = Infinity;
	this.first = true;
	this.infinite = new window.InfiniteScroll(this.container, {
		path: function() {
			var text = me.first ? '' : me.uiInput.value;
			var url;
			if (text.startsWith('#') || text.startsWith('/')) {
				url = normUrl(text);
				if (text.endsWith('#')) url = url + '#';
				text = null;
			}
			var filter = Object.assign({
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
	var parent = this.input.parentNode;
	while (parent) {
		parent = parent.parentNode.closest('.field,.fieldset');
		if (parent) parent.classList.add('href');
	}
	return this.searchUpdate();
};

Href.prototype.searchUpdate = function() {
	if (!this.infinite) return this.searchStart();
	this.container.textContent = "";
	this.infinite.pageIndex = 1;
	this.infinite.loadNextPage().then(({ body }) => {
		this.first = false;
		var data = JSON.parse(body).data;
		if (data.length == 0) this.lastPageIndex = this.infinite.pageIndex;
		var node = this.container.ownerDocument.createElement('div');
		this.cache(data);
		this.renderList(data, node);
		this.infinite.appendItems(Array.from(node.children));
	});
};

Href.prototype.searchStop = function(cancel) {
	if (this.infinite) {
		this.infinite.destroy();
		delete this.infinite;
	}
	Pageboard.write.classList.remove('href');
	var parent = this.input.parentNode;
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
};

Href.prototype.set = function(str) {
	if (!str) {
		this.list = [];
	} else {
		str = normUrl(str);
		if (Href.cache[str]) {
			if (this.uiInput.value != str) this.uiInput.value = str;
			this.list = [Href.cache[str]];
		}
	}
	this.renderList(this.list);
};

Href.prototype.uploadStart = function() {
	// TODO is it possible to upload multiple files in separate steps
	// to avoid reaching the max body server upload limit ?
	var input = document.createElement('input');
	input.type = "file";
	input.multiple = true;
	var me = this;
	return new Promise(function(resolve, reject) {
		input.addEventListener('change', function() {
			var fd = new FormData();
			if (input.files.length == 0) return resolve();
			for (var i=0; i < input.files.length; i++) {
				fd.append("files", input.files[i]);
			}
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "/.api/upload", true);
			xhr.setRequestHeader('Accept', "application/json; q=1.0");
			var tracker = me.uploading();
			tracker(0);

			xhr.upload.addEventListener("progress", function(e) {
				if (e.lengthComputable) {
					var percent = Math.round((e.loaded * 100) / e.total);
					if (percent >= 100) percent = 99; // only load event can reach 100
					tracker(percent);
				}
			});

			xhr.addEventListener('load', function() {
				tracker(100);
				var response;
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
				var msg = xhr.statusText || "Connection error";
				var err = new Error(msg);
				err.statusCode = xhr.status;
				tracker(msg + '(' + xhr.status + ')');
				reject(err);
			});

			xhr.send(fd);
		});
		input.value = null;
		input.click();
	}).then(function(obj) {
		var files = Array.isArray(obj) ? obj : (obj && obj.items || []);
		var p = Promise.resolve();
		files.forEach(function(file) {
			p = p.then(function() {
				return me.insert(file);
			});
		});
		return p.then(function() {
			if (files.length == 1) Pageboard.trigger(me.input, 'change');
		});
	});
};

Href.prototype.uploadStop = function() {};

Href.prototype.uploading = function() {
	var root = Pageboard.notify.dom();
	var progress = root.dom(`<div class="ui blue attached progress"><div class="bar"></div></div>`);
	root.appendChild(progress);
	var $node = $(progress).progress({
		percent: 0
	});

	var finished = false;
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
};

Href.prototype.remove = function(href) {
	var me = this;
	return Pageboard.uiLoad(this.node, Pageboard.fetch('delete', '/.api/href', {
		url: href
	})).then(function(obj) {
		me.cache([obj]);
		me.list = me.list.filter(function(obj) {
			return obj.url != href;
		});
	});
};

Href.prototype.get = function(href) {
	var obj = Href.cache[normUrl(href)];
	if (obj) return Promise.resolve(obj);
	return Pageboard.uiLoad(this.node, Pageboard.fetch('get', '/.api/hrefs', {
		url: href
	})).then(function(obj) {
		return obj.data;
	});
};

Href.prototype.insert = function(url) {
	url = normUrl(url);
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
};

Href.prototype.renderList = function(list, container) {
	if (list) this.list = list;
	else list = this.list;
	if (!list) throw new Error("Need a list to render");
	if (!container) container = this.container;
	var selected = this.input.value;
	if (selected) selected = normUrl(selected);
	if (list.rendered) {
		container.childNodes.forEach(function(child) {
			if (child.nodeType != Node.ELEMENT_NODE) return;
			var href = child.getAttribute('href');
			if (href == selected) child.classList.add('selected');
			else child.classList.remove('selected');
		});
		return;
	}
	list.rendered = true;
	container.textContent = ' ';
	list.forEach(function(obj) {
		var item = this.renderItem(obj);
		if (selected && item.getAttribute('href') == selected) {
			item.classList.add('selected');
			container.insertBefore(item, container.firstChild);
		} else {
			container.appendChild(item);
		}
	}, this);
	container.className = `ui items ${this.opts.display || ''}`;
};

Href.prototype.renderItem = function(obj) {
	var dims = tplDims(obj);
	var display = this.opts.display;

	var item = document.dom(`<a href="${normUrl(obj.url)}" class="item">
		<div class="content">
			<div class="ui tiny header">
				${obj.title || '-'}
				<div class="ui pinned right compact circular large icon button" data-action="remove">
					<i class="icon ban"></i>
				</div>
			</div>
		</div>
	</a>`);
	var content = item.firstElementChild;

	content.appendChild(item.dom(`<div class="left floated meta">
		${obj.mime.split(';').shift()}<em>${tplSize(obj.meta.size)}</em><br>
		${dims ? dims + '<br>' : ''}
		${Pageboard.utils.Duration(obj.updated_at)}
		${obj.type == 'link' ? ('<br><span class="line">' + obj.url + '</span>') : ''}
	</div>
	${tplPreview(obj.preview)}`));
	if (obj.icon) {
		content.appendChild(item.dom(`<img src="${obj.icon}" class="ui avatar icon image" />`));
	}

	if (!obj.visible || this.opts.readOnly) {
		item.querySelector('[data-action="remove"]').remove();
	}
	return item;
};

function tplSize(size) {
	if (!size) return '';
	return ' (' + Pageboard.utils.PrettyBytes(size) + ')';
}

function tplDims(obj) {
	var str = "";
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

function tplPreview(preview) {
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

function normUrl(url) {
	// keeps only path if same domain
	return Page.format(Page.parse(url));
}

})(window.Pageboard);

