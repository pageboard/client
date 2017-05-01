(function(Pageboard) {
Pageboard.Href = Href;

function Href(input) {
	this.renderList = this.renderList.bind(this);
	this.cache = this.cache.bind(this);
	this.set = this.set.bind(this);
	this.action = null;
	this.input = input;
	this.list = [];
	this.map = {};
	this.init();
	this.renderField();
	// initialize
	var me = this;
	if (input.value) {
		this.get(input.value).then(this.cache).then(function() {
			me.set(input.value);
		});
	} else {
		this.act('search');
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
		if (me.searching) me.searchUpdate();
	});

	this.node.addEventListener('focusin', function(e) {
		if (!e.target.matches('input')) return;
		if (!me.action) me.act('search');
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
			return Pageboard.uiLoad(remove, this.remove(href)).then(function() {
				me.renderList();
			});
		} else {
			if (href == input.value) {
				if (this.action == 'search') {
					this.searchStop();
				} else {
					this.set(this.input.value);
				}
			} else {
				input.value = href;
				this.renderList();
				Pageboard.trigger(input, 'change');
			}
		}
	}.bind(this));
};

Href.prototype.change = function() {
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
		content = dom`<input class="search" type="text" placeholder="Paste url..." />
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
		content = dom`<input class="search" type="text" placeholder="Search..." />
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
		content = dom`<input class="search" type="text" placeholder="Search..." />
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
		map[list[i].url] = list[i];
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
	this.set(this.input.value);
	Pageboard.trigger(this.input, 'change');
};

Href.prototype.searchStart = function() {
	Pageboard.write.classList.add('href');
	this.node.querySelector('input').focus();
	return this.searchUpdate();
};

Href.prototype.searchUpdate = function() {
	return Pageboard.uiLoad(this.node, GET('/api/href', {
		text: this.node.querySelector('input').value
	})).then(this.cache).then(this.renderList);
};

Href.prototype.searchStop = function() {
	Pageboard.write.classList.remove('href');
	this.set(this.input.value);
	Pageboard.trigger(this.input, 'change');
};

Href.prototype.set = function(str) {
	if (!str) {
		this.list = [];
	} else {
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
			xhr.open("POST", "/public/uploads", true);
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
	var str = '<div class="ui blue attached progress"><div class="bar"></div></div>';
	var root = Pageboard.notify.dom();
	root.insertAdjacentHTML('beforeEnd', str);
	var progress = root.lastChild;
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
	return DELETE('/api/href', {url: href}).then(function(obj) {
		var list = [];
		me.map[href] = obj;
		me.list.forEach(function(obj) {
			if (obj.url != href) list.push(obj);
		});
		me.list = list;
	});
};

Href.prototype.get = function(href) {
	return Pageboard.uiLoad(this.node, GET('/api/href', {url: href}));
};

Href.prototype.insert = function(url) {
	var me = this;
	return Pageboard.uiLoad(this.node, POST('/api/href', {url: url})).then(function(result) {
		me.cache([result]);
		me.renderList(me.list.concat(result));
	});
};

Href.prototype.renderList = function(list) {
	if (list) this.list = list;
	else list = this.list;
	if (!list) throw new Error("Need a list to render");
	var container = this.container;
	var selected = this.input.value;
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
		var item = renderItem(obj);
		if (selected && obj.url == selected) {
			containsSelected = true;
			item.classList.add('selected');
			container.insertBefore(item, container.firstChild);
		} else {
			container.appendChild(item);
		}
	});

	if (selected && !containsSelected) {
		var item = renderItem(this.map[selected]);
		item.classList.add('selected');
		container.insertBefore(item, container.firstChild);
	}
};

function renderItem(obj) {
	var item = dom`<a href="${obj.url}" class="item" title="${obj.meta.description || ""}">
		<div class="content">
			<div class="ui tiny header">
				<img src="${obj.icon || ''}" class="ui avatar icon image" />
				${obj.title}
				<div class="ui right floated compact circular icon button" data-action="remove">
					<i class="icon ban"></i>
				</div>
			</div>
			<div class="left floated meta">
				${obj.mime}<em>${tplSize(obj.meta.size)}</em><br>
				${tplDims(obj)}<br>
				${moment(obj.updated_at).fromNow()}
			</div>
			${tplThumbnail(obj.meta.thumbnail)}
		</div>
	</a>`;
	if (!obj.icon) {
		item.querySelector('.icon.image').replaceWith(
			dom`<i class="ui avatar external icon"></i>`
		);
	}
	if (!obj.visible) {
		item.querySelector('[data-action="remove"]').remove();
	}
	return item;
}

function tplSize(size) {
	if (!size) return '';
	return ' (' + PrettyBytes(size) + ')';
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
	if (src) return dom`<img src="${src}" class="ui tiny right floated image" />`;
	else return '';
}

Href.prototype.destroy = function() {
	Pageboard.write.classList.remove('href');
};

})(window.Pageboard);

