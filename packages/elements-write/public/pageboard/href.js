(function(Pageboard) {
Pageboard.Href = Href;

function Href(input) {
	this.show = this.show.bind(this);
	this.input = input;
	this.value = input.value;
	this.map = {};

	input.insertAdjacentHTML('afterEnd', [
		'<div class="ui left icon input">',
			'<i class="search icon"></i>',
			'<div class="ui icon top right pointing dropdown blue button">',
				'<i class="add icon"></i>',
				'<div class="menu">',
					'<div class="item" data-action="upload">Upload file(s)</div>',
					'<div class="item" data-action="paste">Paste URL</div>',
				'</div>',
			'</div>',
		'</div><div class="ui href items"></div>'
	].join('\n'));
	// move the input to keep form validation working
	this.node = input.nextSibling;
	this.list = this.node.nextSibling;
	this.list.addEventListener('click', function(e) {
		if (e.target.closest('a')) e.preventDefault();
	}, true);
	var button = this.node.querySelector('.button');
	$(button).dropdown();
	var icon = this.icon = button.querySelector('.icon');
	var menu = button.querySelector('.menu');

	this.node.insertBefore(input, button);

	var me = this;

	// setup search
	this.search = document.createElement('input');
	this.search.className = 'search';
	this.node.insertBefore(this.search, button);
	this.search.addEventListener('input', function() {
		me.uiLoad(GET('/api/href', {
			text: me.search.value
		})).then(me.show);
	});

	// keyup event, otherwise input.value is not yet updated
	input.addEventListener('keypress', function(e) {
		e.preventDefault();
		if (!me.searching) {
			if (e.key.length == 1) me.search.value = e.key;
			me.searchStart();
			me.uiLoad(GET('/api/href', {
				text: me.search.value
			})).then(me.show);
		}
	});

	// setup url handling
	input.addEventListener('paste', function() {
		setTimeout(function() {
			me.value = input.value;
			me.add(input.value);
		});
	});

	// setup upload
	button.addEventListener('click', function(e) {
		if (icon.classList.contains('add')) {
			var action = e.target.dataset.action;
			if (!action || !me[action]) return;
			me[action]();
		} else if (icon.classList.contains('remove')) {
			me.clear();
			if (me.searching) {
				me.searchStop();
			}
			input.focus();
		}
	});

	this.list.addEventListener('click', function(e) {
		e.preventDefault();
		var item = e.target.closest('.item');
		if (!item) {
			e.stopPropagation();
			return;
		}
		var href = item.getAttribute('href');
		var remove = e.target.closest('[data-action="remove"]');
		if (remove) {
			remove.classList.add("loading");
			me.remove(href).then(function() {
				item.remove();
			}).catch(function(err) {
				remove.classList.remove("loading");
				Pageboard.notify("Remove failed", err);
			});
			return;
		}
		me.set(me.map[href]);

		input.value = href;
		var event = document.createEvent('Event');
		event.initEvent('change', true, true);
		input.dispatchEvent(event);
	}.bind(this));

	// initialize
	if (input.value) {
		this.get(input.value).then(function(item) {
			me.set(item);
		});
	}
}

Href.prototype.searchStart = function() {
	this.searching = true;
	document.querySelector('#pageboard-write').classList.add('href');
	this.node.closest('.field').classList.add('href');
	this.node.classList.add('left');
	this.node.classList.add('icon');
	this.icon.classList.remove('add');
	this.icon.classList.add('remove');
	this.search.focus();
};

Href.prototype.searchStop = function() {
	this.searching = false;
	this.search.value = "";
	document.querySelector('#pageboard-write').classList.remove('href');
	this.node.closest('.field').classList.remove('href');
	this.node.classList.remove('left');
	this.node.classList.remove('icon');
};

// display mode
// the current url is not shown inside search field
// the current href is shown alone below the field, selected

// focus input -> search mode
// the list takes all height (search mode)
// the current href is shown at the top of the list,
// latest href are listed below

// search mode -> input input
// the current href is shown at the top of the list,
// the list is updated with search results

// in search mode, a click on some href selects it
// in search mode, a second click on a selected href changes input.value and closes search mode
// in search mode, a click on x button closes search mode

// upload mode
// there is no upload mode - uploading notifications take place in notification, that's all
// to see uploaded files, just go into search mode

// paste mode
// show an input (without search icon) with a placeholder "paste url here"
// and focus it
// the + button is now a x button for leaving "paste mode"
// when a url is pasted, change input value and close paste mode

Href.prototype.paste = function() {
	// TODO

};

Href.prototype.upload = function() {
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
				return me.add(file);
			});
		});
		return p;
	});
};

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
	return DELETE('/api/href', {url: href});
};

Href.prototype.get = function(href) {
	return this.uiLoad(GET('/api/href', {url: href}));
};

Href.prototype.set = function(result) {
	this.icon.classList.remove('add');
	this.icon.classList.add('remove');
	var item = this.show(result)[0];
	Array.from(this.list.querySelectorAll('.item')).forEach(function(item) {
		item.classList.remove('selected');
	});
	item.classList.add('selected');
};

Href.prototype.clear = function() {
	this.input.value = "";
	this.icon.classList.remove('remove');
	this.icon.classList.add('add');
	this.list.textContent = "";
};

Href.prototype.uiLoad = function(p) {
	var classList = this.node.classList;
	classList.add('loading');
	return p.catch(function(err) {
		classList.remove('loading');
		Pageboard.notify("Loading error", err);
		// rethrow, we don't want to show any result
		throw err;
	}).then(function(results) {
		classList.remove('loading');
		return results;
	});
};

Href.prototype.add = function(url) {
	return this.uiLoad(POST('/api/href', {url: url})).then(this.show);
};

Href.prototype.show = function(results) {
	var clear = true;
	if (!Array.isArray(results)) {
		clear = false;
		results = [results];
	} else {
		this.map = {};
	}
	var list = this.list;
	if (clear) list.textContent = "";
	var map = this.map;
	return results.map(function(obj) {
		map[obj.url] = obj;
		var olditem = list.querySelector('[href="'+obj.url+'"]');
		var item = mergeItem(obj);
		if (olditem) list.replaceChild(item, olditem);
		else list.appendChild(item);
		return item;
	});
};

function mergeItem(obj) {
	return html`<a href="${obj.url}" class="item" title="${obj.meta.description || ""}">
		<div class="content">
			<div class="ui tiny header">
				<div class="ui tiny compact circular icon button" data-action="set">
					<i class="icon checkmark"></i>
				</div>
				<img src="${obj.icon}" class="ui avatar icon image" />
				${obj.title}
				<div class="ui right floated tiny compact circular icon button" data-action="remove">
					<i class="icon close"></i>
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
}

function tplSize(size) {
	if (!size) return '';
	return ' (' + PrettyBytes(size) + ')';
}

function tplDims(obj) {
	var str = "";
	if (obj.type == "video" || obj.type == "image") {
		if (obj.meta.width) {
			str += 'width ' + obj.meta.width + 'px';
		}
		if (obj.meta.height) {
			str += ", height " + obj.meta.height  + 'px';
		}
	}
	if (obj.meta.duration) {
		str += " - " + obj.meta.duration;
	}
	return str;
}

function tplThumbnail(src) {
	if (src) return html`<img src="${src}" class="ui tiny right floated image" />`;
	else return '';
}

Href.prototype.destroy = function() {
	document.querySelector('#pageboard-write').classList.remove('href');
};

})(window.Pageboard);

