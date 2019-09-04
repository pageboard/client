(function(Pageboard) {

Pageboard.schemaHelpers.page = PageHelper;

PageHelper.cache = {};

function PageHelper(input, opts, props, block) {
	this.renderList = this.renderList.bind(this);
	this.cache = this.cache.bind(this);
	this.opts = opts;
	this.input = input;
	input.type = "hidden";
	this.block = block;
	this.ignoreEvents = false;
}

PageHelper.prototype.init = function() {
	var input = this.input;

	var nodes = input.dom(`<div class="ui input"></div>
		<div class="ui items"></div>`);
	this.container = nodes.lastElementChild;
	this.node = this.container.previousElementSibling;

	if (this.opts.query) {
		var fieldset = input.dom('<fieldset class="field href page-href"></fieldset>');
		input.after(fieldset);
		fieldset.appendChild(nodes);
		var label = input.previousElementSibling;
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
		this.inputMap.addEventListener('change', function(e) {
			e.stopPropagation();
			this.searchStop();
		}.bind(this));
	} else {
		input.parentNode.classList.add('href', 'page-href');
		input.after(...nodes.children);
	}

	this.container.addEventListener('click', function(e) {
		if (e.target.closest('a')) e.preventDefault();
	}, true);

	var me = this;

	this.node.addEventListener('input', Pageboard.debounce(function(e) {
		if (me.ignoreEvents) return;
		if (me.action == "search") {
			me.searchUpdate();
		} else if (!me.action) {
			me.write();
			me.start("search");
		}
	}, 100));

	this.node.addEventListener('focusin', function(e) {
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

	this.node.addEventListener('click', function(e) {
		if (me.ignoreEvents) return;
		if (e.target.closest('input')) return;
		var actioner = e.target.closest('[data-action]');
		if (actioner) this.start(actioner.dataset.action);
		else this.stop();
	}.bind(this));

	this.container.addEventListener('click', function(e) {
		e.preventDefault();
		var item = e.target.closest('.item');
		if (!item) {
			e.stopPropagation();
			return;
		}
		if (this.action == 'search') {
			me.fakeInput.value = item.getAttribute('href');
			this.stop();
		}
	}.bind(this));
};

PageHelper.prototype.destroy = function() {
	Pageboard.write.classList.remove('href');
};

PageHelper.prototype.update = function() {
	this.list = [];
	this.renderField();
	var val = this.input.value;
	if (val && !this.fakeInput.value) {
		this.read();
	}
	this.renderList();
};

PageHelper.prototype.start = function(action) {
	if (this.action == action) return;
	this.ignoreEvents = true;
	this.stop();
	this.action = action;
	this.renderField();
	this[action + 'Start']();
	this.ignoreEvents = false;
};

PageHelper.prototype.stop = function() {
	var prev = this.action;
	if (prev) {
		this[prev + 'Stop']();
		this.action = null;
	}
	this.renderField();
};

PageHelper.prototype.renderField = function() {
	var content;
	var title = this.input.title || "";
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
};

PageHelper.prototype.cache = function(list) {
	var cache = PageHelper.cache;
	for (var i=0; i < list.length; i++) {
		cache[list[i].url] = list[i];
	}
	return list;
};

PageHelper.prototype.searchStart = function(same) {
	if (same) {
		return;
	}
	var me = this;
	var input = this.fakeInput;
	setTimeout(function() {
		input.focus();
	});
	this.infinite = new window.InfiniteScroll(this.container, {
		path: function() {
			var limit = me.opts.limit || 10;
			var filter = {
				type: me.opts.type,
				limit: limit,
				offset: (this.pageIndex - 1) * limit
			};
			var text = me.fakeInput.value;
			if (text && !text.startsWith('/')) filter.text = text;
			else filter.url = text || '/';
			return Page.format({
				pathname: '/.api/pages',
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
		var data = response.items;
		var node = me.container.ownerDocument.createElement('div');
		me.cache(data);
		me.renderList(data, node);
		this.appendItems(Array.from(node.children));
	});
	Pageboard.write.classList.add('href');
	this.input.closest('form').classList.add('href');
	var parent = this.input;
	while ((parent=parent.parentNode.closest('fieldset'))) {
		parent.classList.add('href');
	}
	return this.searchUpdate();
};

PageHelper.prototype.searchUpdate = function() {
	this.container.textContent = "";
	this.infinite.pageIndex = 1;
	this.infinite.loadNextPage();
};

PageHelper.prototype.searchStop = function() {
	if (this.infinite) {
		this.infinite.destroy();
		delete this.infinite;
	}
	this.container.textContent = '';
	Pageboard.write.classList.remove('href');
	this.input.closest('form').classList.remove('href');
	var parent = this.input;
	while ((parent=parent.parentNode.closest('fieldset'))) {
		parent.classList.remove('href');
	}
	Pageboard.scrollbar.update();
	this.write();
	Pageboard.trigger(this.input, 'change');
};

PageHelper.prototype.get = function(href) {
	var urlObj = Page.parse(href);
	var obj = PageHelper.cache[urlObj.pathname];
	if (obj) return Promise.resolve(obj);
	return Pageboard.uiLoad(this.node, Pageboard.fetch('get', '/.api/pages', {
		url: urlObj.pathname,
		type: this.opts.type
	})).then(function(obj) {
		return obj.items;
	});
};

PageHelper.prototype.renderList = function(list, container) {
	if (list) this.list = list;
	else list = this.list;
	if (!list) throw new Error("Need a list to render");
	if (!container) container = this.container;
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
	container.textContent = '';
	list.forEach(function(obj) {
		var item = this.renderItem(obj);
		if (selected && item.getAttribute('href') == selected) {
			item.classList.add('selected');
			container.insertBefore(item, container.firstChild);
		} else {
			container.appendChild(item);
		}
	}, this);
};

PageHelper.prototype.renderItem = function(block) {
	return document.dom(`<a href="${block.data.url}" class="item">
		<div class="content">
			<div class="ui tiny header">
				${block.data.title}
			</div>
			<div class="left floated meta">
				${window.moment(block.updated_at || block.data.updated_at).fromNow()}
				<br><span class="line">${block.data.url}</span>
			</div>
		</div>
	</a>`);
};

PageHelper.prototype.read = function() {
	var val = Page.parse(this.input.value);
	if (this.input.value.startsWith('/')) {
		this.fakeInput.value = val.pathname;
	} else {
		this.fakeInput.value = "";
	}
	if (this.inputMap) this.inputMap.value = val.query;
};

PageHelper.prototype.write = function() {
	this.input.value = this.format(this.fakeInput.value, this.inputMap && this.inputMap.value);
};

PageHelper.prototype.format = function(pathname, query) {
	var list = [];
	if (query) Object.keys(query).forEach(function(key) {
		var val = query[key];
		if (!Array.isArray(val)) val = [val];
		val.forEach(function(val) {
			var item = encodeURIComponent(key);
			if (typeof val == "string" && val.fuse({$query: {}, $body: {}, $response: {}}, {}) != val) {
				// do not escape val
				item += '=' + val;
			} else if (val != null) {
				item += '=' + encodeURIComponent(val);
			}
			list.push(item);
		});
	});
	var qstr = list.join('&');
	if (qstr.length) qstr = '?' + qstr;
	return (pathname || "") + qstr;
};


})(window.Pageboard);

