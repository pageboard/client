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
	input.type = "hidden";
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

	input.insertAdjacentHTML('afterEnd', `<div class="ui input"></div>
		<div class="ui items"></div>`);

	this.node = input.nextElementSibling;
	this.container = this.node.nextElementSibling;
	this.container.addEventListener('click', function(e) {
		if (e.target.closest('a')) e.preventDefault();
	}, true);

	var me = this;

	this.node.addEventListener('input', function(e) {
		if (me.action == "search") {
			me.searchUpdate();
		} else if (me.action == "manual") {
			me.trigger();
		} else if (!me.action) {
			input.value = "";
			Pageboard.trigger(input, 'change');
			me.start("search");
		}
	});

	this.node.addEventListener('focusout', function(e) {
		if (!e.target.matches('input')) return;
		if (me.action == "manual") me.manualStop();
	});

	this.node.addEventListener('focusin', function(e) {
		if (!e.target.matches('input')) return;
		if (!me.action) {
			if (me.input.value) {
				me.node.querySelector('input').select();
				if (me.list && me.list.length == 0) me.start('manual');
			} else {
				me.start('search');
			}
		}
	});

	this.node.addEventListener('click', function(e) {
		var actioner = e.target.closest('[data-action]');
		if (!actioner) {
			if (e.altKey) {
				this.start('manual');
				me.node.querySelector('input').focus();
			}
			return;
		}
		this.start(actioner.dataset.action);
	}.bind(this));

	this.container.addEventListener('click', function(e) {
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
			return Pageboard.uiLoad(remove, this.remove(Href.cache[href].url)).then(function() {
				me.renderList();
				Pageboard.scrollbar.update();
			});
		} else {
			if (href == input.value) {
				if (this.action == 'search') {
					this.stop(this.action);
				} else {
					// this.set(input.value);
				}
			} else {
				input.value = href;
				var data = Href.cache[href];
				// if (!Pageboard.hrefs[href]) {
				if (!data) {
					// Pageboard.hrefs[href] = Object.assign({
					Href.cache[href] = Object.assign({
						mime: data.mime
					}, data.meta);
					console.info("added href to cache", href, Pageboard.hrefs[href]);
				}
				Pageboard.trigger(input, 'change');
			}
		}
	}.bind(this));
	this.update(block);
};

Href.prototype.destroy = function() {
	Pageboard.write.classList.remove('href');
};

Href.prototype.update = function(block) {
	if (!this.list) this.list = [];
	this.renderField();
	var me = this;
	var val = this.input.value;
	var input = this.node.querySelector('input');
	if (val && !input.value) {
		input.value = val;
	}
	if (val && !this.action) {
		this.get(val).then(this.cache).then(function(list) {
			if (list.length == 0) {
				me.start("manual");
			} else {
				me.set(val);
			}
		});
	} else {
		this.renderList();
	}
};

Href.prototype.start = function(action) {
	var same = this.action == action;
	this.stop();
	if (same) return;
	this.action = action;
	this.renderField();
	this[action + 'Start']();
};

Href.prototype.stop = function() {
	var prev = this.action;
	if (prev) {
		this.action = null;
		this[prev + 'Stop']();
		this.renderField();
	}
};

Href.prototype.renderField = function() {
	var content;
	switch (this.action) {
	case "manual":
		content = document.dom(`<input class="search" type="text" placeholder="Type url..." />
		<div class="ui blue icon buttons">
			<div class="ui button" data-action="search" title="Stop">
				<i class="close icon"></i>
			</div>
		</div>`);
		break;
	case "paste":
		content = document.dom(`<input class="search" type="text" placeholder="Paste url..." />
		<div class="ui blue icon buttons">
			<div class="ui button" data-action="search" title="Search">
				<i class="search icon"></i>
			</div>
			<div class="ui active button" data-action="paste" title="Paste url">
				<i class="paste icon"></i>
			</div>
			<div class="ui button" data-action="upload" title="Upload files">
				<i class="upload icon"></i>
			</div>
		</div>`);
		break;
	case "search":
		content = document.dom(`<input class="search" type="text" placeholder="Search..." />
		<div class="ui blue icon buttons">
			<div class="ui active button" data-action="search" title="Search">
				<i class="search icon"></i>
			</div>
			<div class="ui button" data-action="paste" title="Paste url">
				<i class="paste icon"></i>
			</div>
			<div class="ui button" data-action="upload" title="Upload files">
				<i class="upload icon"></i>
			</div>
		</div>`);
		break;
	default:
		content = document.dom(`<input class="search" type="text" placeholder="Search..." value="${this.input.value}" />
		<div class="ui blue icon buttons">
			<div class="ui button" data-action="search" title="Search">
				<i class="search icon"></i>
			</div>
			<div class="ui button" data-action="paste" title="Paste url">
				<i class="paste icon"></i>
			</div>
			<div class="ui button" data-action="upload" title="Upload files">
				<i class="upload icon"></i>
			</div>
		</div>`);
	}
	if (this.opts.readOnly) {
		removeBtn(content, 'upload');
		removeBtn(content, 'paste');
	}
	this.node.textContent = '';
	this.node.appendChild(content);
};

function removeBtn(from, what) {
	var btn = from.querySelector(`[data-action="${what}"]`);
	if (btn) btn.remove();
}

Href.prototype.cache = function(list) {
	var map = Href.cache;
	for (var i=0; i < list.length; i++) {
		map[normUrl(list[i].url)] = list[i];
	}
	return list;
};

Href.prototype.manualStart = function() {
	var input = this.node.querySelector('input');
	input.value = this.input.value;
	this.renderList([]);
};

Href.prototype.manualStop = function() {
	this.realTrigger();
};

Href.prototype.pasteStart = function() {
	var input = this.node.querySelector('input');
	input.focus();
	var me = this;
	input.addEventListener('paste', function() {
		setTimeout(function() {
			me.insert(input.value);
			if (me.action == "paste") me.pasteStop();
		});
	});
};

Href.prototype.pasteStop = function() {
//	this.set(this.input.value);
	Pageboard.trigger(this.input, 'change');
};

Href.prototype.searchStart = function() {
	var me = this;
	var input = this.node.querySelector('input');
	input.focus();
	this.infinite = new window.InfiniteScroll(this.container, {
		path: function() {
			var filter = Object.assign({
				text: me.node.querySelector('input').value
			}, me.opts.filter);
			filter.limit = 10;
			filter.offset = (this.pageIndex - 1) * filter.limit;
			return Page.format({
				pathname: '/.api/hrefs',
				query: filter
			});
		},
		responseType: 'text',
		scrollThreshold: 400,
		elementScroll: Pageboard.write,
		loadOnScroll: true,
		history: false,
		debug: false
	});
	this.infinite.on('load', function(response) {
		response = JSON.parse(response);
		var data = response.data;
		var node = me.container.ownerDocument.createElement('div');
		me.cache(data);
		me.renderList(data, node);
		this.appendItems(Array.from(node.children));
	});
	Pageboard.write.classList.add('href');
	this.input.closest('form').classList.add('href');
	return this.searchUpdate();
};

Href.prototype.searchUpdate = function() {
	this.container.textContent = "";
	if (this.infinite) {
		this.infinite.pageIndex = 1;
		this.infinite.loadNextPage();
	}
};

Href.prototype.searchStop = function() {
	if (this.infinite) {
		this.infinite.destroy();
		delete this.infinite;
	}
	Pageboard.write.classList.remove('href');
	this.input.closest('form').classList.remove('href');
	this.set(this.input.value);
	Pageboard.scrollbar.update();
	Pageboard.trigger(this.input, 'change');
};

Href.prototype.set = function(str) {
	if (!str) {
		this.list = [];
	} else {
		str = normUrl(str);
		if (Href.cache[str]) this.list = [Href.cache[str]];
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
		input.click();
		input.value = null;
	}).then(function(files) {
		if (!files) return;
		var p = Promise.resolve();
		files.forEach(function(file) {
			p = p.then(function() {
				return me.insert(file);
			});
		});
		return p;
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
	var me = this;
	return Pageboard.uiLoad(this.node, Pageboard.fetch('post', '/.api/href', {
		url: url
	})).then(function(result) {
		me.cache([result]);
		me.renderList(me.list.concat(result));
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
		Array.from(container.childNodes).forEach(function(child) {
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
				${obj.title}
				<div class="ui pinned right compact circular large icon button" data-action="remove">
					<i class="icon ban"></i>
				</div>
			</div>
		</div>
	</a>`);
	var content = item.firstElementChild;
	if (display != "icon") {
		content.appendChild(item.dom(`<div class="left floated meta">
			${obj.mime.split(';').shift()}<em>${tplSize(obj.meta.size)}</em><br>
			${dims ? dims + '<br>' : ''}
			${window.moment(obj.updated_at).fromNow()}
			${obj.type == 'link' ? ('<br><span class="line">' + obj.pathname + '</span>') : ''}
		</div>
		${tplPreview(obj.preview)}`));
		if (obj.icon) {
			content.appendChild(item.dom(`<img src="${obj.icon}" class="ui avatar icon image" />`));
		}
	} else {
		content.appendChild(item.dom(`<img class="ui tiny centered image" src="${obj.url}" />`));
	}
	if (!obj.visible || this.opts.readOnly) {
		item.querySelector('[data-action="remove"]').remove();
	}
	return item;
};

function tplSize(size) {
	if (!size) return '';
	return ' (' + Pageboard.PrettyBytes(size) + ')';
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

