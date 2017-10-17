(function(Pageboard) {
Pageboard.inputs.href = Href;

function Href(input, opts) {
	this.renderList = this.renderList.bind(this);
	this.cache = this.cache.bind(this);
	this.set = this.set.bind(this);
	this.opts = opts;
	this.action = null;
	this.input = input;
	this.list = [];
	this.map = {};
	this.init();
	this.renderField();
	// initialize
	var me = this;

	var val = input.value;
	if (val) {
		// restore baseUrl on input value
		var urlObj = Page.parse(val);
		if (!urlObj.hostname) {
			urlObj.hostname = document.location.hostname;
			urlObj.protocol = document.location.protocol;
			urlObj.port = document.location.port;
			val = Page.format(urlObj);
		}
		this.get(val).then(this.cache).then(function() {
			me.set(val);
		});
	}
}

Href.prototype.init = function() {
	var input = this.input;
	input.parentNode.classList.add('href');

	input.insertAdjacentHTML('afterEnd', '<div class="ui input"></div>\
<div class="ui items"></div>');

	this.node = input.nextSibling;
	this.container = this.node.nextSibling;
	this.container.addEventListener('click', function(e) {
		if (e.target.closest('a')) e.preventDefault();
	}, true);

	var me = this;

	this.node.addEventListener('input', function(e) {
		if (me.action == "search") {
			me.searchUpdate();
		} else if (!me.action) {
			input.value = "";
			Pageboard.trigger(input, 'change');
			me.act("search");
		}
	});

	this.node.addEventListener('focusin', function(e) {
		if (!e.target.matches('input')) return;
		if (!me.action) {
			if (me.input.value) {
				me.node.querySelector('input').select();
			} else {
				me.act('search');
			}
		}
	});

	this.node.addEventListener('click', function(e) {
		var actioner = e.target.closest('[data-action]');
		if (!actioner) return;
		this.act(actioner.dataset.action);
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
			return Pageboard.uiLoad(remove, this.remove(this.map[href].url)).then(function() {
				me.renderList();
			});
		} else {
			if (href == input.value) {
				if (this.action == 'search') {
					this.act(this.action);
				} else {
//					this.set(input.value);
				}
			} else {
				input.value = href;
				this.renderList();
				Pageboard.trigger(input, 'change');
			}
		}
	}.bind(this));
};

Href.prototype.destroy = function() {
	Pageboard.write.classList.remove('href');
};

Href.prototype.update = function(block) {
	this.renderList();
};

Href.prototype.act = function(action) {
	var prev = this.action;
	var same = prev == action;

	if (prev) {
		this.action = null;
		this[prev + 'Stop']();
		if (same) {
			this.renderField();
			return;
		}
	}
	this.action = action;
	this.renderField();
	this[action + 'Start']();
};

Href.prototype.renderField = function() {
	var content;
	switch (this.action) {
	case "paste":
		content = document.dom`<input class="search" type="text" placeholder="Paste url..." />
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
		</div>`;
	break;
	case "search":
		content = document.dom`<input class="search" type="text" placeholder="Search..." />
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
		</div>`;
	break;
	default:
		content = document.dom`<input class="search" type="text" placeholder="Search..." value="${this.input.value}" />
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
		</div>`;
	}
	this.node.textContent = '';
	this.node.appendChild(content);
};

Href.prototype.cache = function(list) {
	var map = this.map;
	for (var i=0; i < list.length; i++) {
		map[normUrl(list[i].url)] = list[i];
	}
	return list;
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
	this.infinite = new InfiniteScroll(this.container, {
		path: function() {
			var filter = Object.assign({
				text: me.node.querySelector('input').value
			}, me.opts.filter);
			filter.paginate = this.pageIndex;
			return Page.format({
				pathname: '/.api/href',
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
		var node = me.container.ownerDocument.createElement('div');
		me.cache(response);
		me.renderList(response, node);
		this.appendItems(node.children);
	});
	Pageboard.write.classList.add('href');
	return this.searchUpdate();
};

Href.prototype.searchUpdate = function() {
	this.container.textContent = "";
	this.infinite.pageIndex = 1;
	this.infinite.loadNextPage();
};

Href.prototype.searchStop = function() {
	if (this.infinite) {
		this.infinite.destroy();
		delete this.infinite;
	}
	Pageboard.write.classList.remove('href');
	this.set(this.input.value);
	Ps.update(Pageboard.write);
	Pageboard.trigger(this.input, 'change');
};

Href.prototype.set = function(str) {
	if (!str) {
		this.list = [];
	} else {
		str = normUrl(str);
		if (this.map[str]) this.list = [this.map[str]];
	}
	this.renderList(this.list);
};

Href.prototype.uploadStart = function() {
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
	var progress = root.dom`<div class="ui blue attached progress"><div class="bar"></div></div>`;
	root.appendChild(progress);
	var $node = $(progress).progress({
		percent: 0
	});

	var finished = false;
	function clean() {
		progress.remove();
	}
	return function(percent) {
		if (finished) return;
		if (typeof percent == "number") {
			$node.progress({percent: percent});
			if (percent < 100) return;
		} else {
			Pageboard.notify("Upload failed", percent);
		}
		progress.remove();
	};
};

Href.prototype.remove = function(href) {
	var me = this;
	return DELETE('/.api/href', {url: href}).then(function(obj) {
		var list = [];
		me.map[normUrl(href)] = obj; // remove is actually "hide from others" so keep a ref to it
		me.list.forEach(function(obj) {
			if (obj.url != href) list.push(obj);
		});
		me.list = list;
	});
};

Href.prototype.get = function(href) {
	return Pageboard.uiLoad(this.node, GET('/.api/href', {url: href}));
};

Href.prototype.insert = function(url) {
	var me = this;
	return Pageboard.uiLoad(this.node, POST('/.api/href', {url: url})).then(function(result) {
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
	var containsSelected = false;
	list.forEach(function(obj) {
		var item = this.renderItem(obj);
		if (selected && item.getAttribute('href') == selected) {
			containsSelected = true;
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

	var item = document.dom`<a href="${normUrl(obj.url)}" class="item" title="${obj.meta.description || ""}">
		<div class="content">
			<div class="ui tiny header">
				<img src="${obj.icon || ''}" class="ui avatar icon image" />
				${obj.title}
				<div class="ui pinned right compact circular icon button" data-action="remove">
					<i class="icon ban"></i>
				</div>
			</div>
		</div>
	</a>`;
	var content = item.firstElementChild;
	if (display != "icon") {
		content.appendChild(item.dom`<div class="left floated meta">
			${obj.type == 'link' ? (obj.pathname + '<br>') : ''}
			${obj.mime.split(';').shift()}<em>${tplSize(obj.meta.size)}</em><br>
			${dims ? dims + '<br>' : ''}
			${moment(obj.updated_at).fromNow()}
		</div>
		${tplThumbnail(obj.meta.thumbnail)}`);
	} else {
		content.appendChild(item.dom`<img class="ui tiny centered image" src="${obj.url}" />`);
	}
	if (!obj.visible) {
		item.querySelector('[data-action="remove"]').remove();
	}
	if (!obj.icon) {
		// TODO do not put "external" when it's actually a local svg
		item.querySelector('.icon.image').replaceWith(
			document.dom`<i class="ui avatar external icon"></i>`
		);
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

function tplThumbnail(src) {
	if (src) return document.dom`<img src="${src}" class="ui tiny right floated image" />`;
	else return '';
}

function normUrl(url) {
	// keeps only path if same domain
	return Page.format(Page.parse(url));
}

})(window.Pageboard);

