(function(Pageboard) {

Pageboard.schemaHelpers.page = PageHelper;

PageHelper.cache = {};

function PageHelper(input, opts, props, block) {
	this.trigger = Pageboard.debounce(this.realTrigger, 500);
	this.renderList = this.renderList.bind(this);
	this.cache = this.cache.bind(this);
	this.set = this.set.bind(this);
	this.opts = opts;
	this.input = input;
	this.block = block;
}

PageHelper.prototype.realTrigger = function() {
	var input = this.node.querySelector('input');
	if (input.value != this.input.value) {
		this.input.value = input.value;
		Pageboard.trigger(this.input, 'change');
		setTimeout(function() {
			input.focus();
		});
	}
};

PageHelper.prototype.init = function() {
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
			me.start("search");
		}
	});

	this.node.addEventListener('focusin', function(e) {
		if (!e.target.matches('input')) return;
		if (!me.action) {
			if (me.input.value) {
				me.node.querySelector('input').select();
			} else {
				me.start('search');
			}
		}
	});

	this.node.addEventListener('focusout', function(e) {
		if (!e.target.matches('input')) return;
		me.stop('search');
	});

	this.node.addEventListener('click', function(e) {
		var actioner = e.target.closest('[data-action]');
		if (actioner) this.start(actioner.dataset.action);
	}.bind(this));

	this.container.addEventListener('click', function(e) {
		e.preventDefault();
		var item = e.target.closest('.item');
		if (!item) {
			e.stopPropagation();
			return;
		}
		var href = item.getAttribute('href');

		if (href == input.value) {
			if (this.action == 'search') {
				this.stop(this.action);
			}
		} else {
			input.value = href;
			this.renderList();
			Pageboard.trigger(input, 'change');
		}
	}.bind(this));
};

PageHelper.prototype.destroy = function() {
	Pageboard.write.classList.remove('href');
};

PageHelper.prototype.update = function() {
	this.list = [];
	this.renderField();
	var me = this;
	var val = this.input.value;
	var input = this.node.querySelector('input');
	if (val && !input.value) {
		input.value = val;
	}
	if (val) {
		this.get(val).then(this.cache).then(function(list) {
			if (list.length == 0) {
				me.start("search");
			} else {
				me.set(val);
			}
		});
	} else {
		this.renderList();
	}
};

PageHelper.prototype.start = function(action) {
	var same = this.action == action;
	this.stop();
	this.action = action;
	this.renderField();
	this[action + 'Start'](same);
};

PageHelper.prototype.stop = function() {
	var prev = this.action;
	if (prev) {
		this.action = null;
		this[prev + 'Stop']();
		this.renderField();
	}
};

PageHelper.prototype.renderField = function() {
	var content;
	switch (this.action) {
	case "search":
		content = document.dom(`<input class="search" type="text" placeholder="PageHelper..." />
		<div class="ui blue icon buttons">
			<div class="ui active button" data-action="search" title="Search">
				<i class="search icon"></i>
			</div>
		</div>`);
		break;
	default:
		content = document.dom(`<input class="search" type="text" placeholder="PageHelper..." value="${this.input.value}" />
		<div class="ui blue icon buttons">
			<div class="ui button" data-action="search" title="Search">
				<i class="search icon"></i>
			</div>
		</div>`);
	}
	this.node.textContent = '';
	this.node.appendChild(content);
};

PageHelper.prototype.cache = function(list) {
	var cache = PageHelper.cache;
	for (var i=0; i < list.length; i++) {
		cache[list[i].url] = list[i];
	}
	return list;
};

PageHelper.prototype.manualStart = function() {
	var input = this.node.querySelector('input');
	input.value = this.input.value;
	this.renderList([]);
};

PageHelper.prototype.manualStop = function() {
	this.realTrigger();
};


PageHelper.prototype.searchStart = function(same) {
	if (same) {
		return;
	}
	var me = this;
	var input = this.node.querySelector('input');
	input.focus();
	this.infinite = new window.InfiniteScroll(this.container, {
		path: function() {
			var limit = me.opts.limit || 10;
			var filter = {
				text: me.node.querySelector('input').value,
				type: me.opts.type,
				limit: limit,
				offset: (this.pageIndex - 1) * limit
			};
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
	Pageboard.write.classList.remove('href');
	this.set(this.input.value);
	Pageboard.scrollbar.update();
	Pageboard.trigger(this.input, 'change');
};

PageHelper.prototype.set = function(str) {
	if (!str) {
		this.list = [];
	} else {
		if (PageHelper.cache[str]) this.list = [PageHelper.cache[str]];
	}
	this.renderList(this.list);
};


PageHelper.prototype.get = function(href) {
	var obj = PageHelper.cache[href];
	if (obj) return Promise.resolve(obj);
	return Pageboard.uiLoad(this.node, Pageboard.fetch('get', '/.api/pages', {
		url: href,
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
	container.className = 'ui items';
};

PageHelper.prototype.renderItem = function(block) {
	return document.dom(`<a href="${block.data.url}" class="item">
		<div class="content">
			<div class="ui tiny header">
				${block.data.title}
			</div>
			<div class="left floated meta">
				${window.moment(block.data.updated_at).fromNow()}
				<br><span class="line">${block.data.url}</span>
			</div>
		</div>
	</a>`);
};


})(window.Pageboard);

