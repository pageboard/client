(function(Pageboard) {
Pageboard.Href = Href;

function Href(input) {
	this.show = this.show.bind(this);
	this.input = input;
	this.value = input.value;

	input.insertAdjacentHTML('afterEnd', [
		'<div class="ui right action input">',
		// '<div class="ui right action left icon input">',
		// '<i class="search icon"></i>',
		'<button class="ui blue right icon button">',
		' <i class="add icon"></i>',
		'</button>',
		'</div><div class="ui href items"></div>'
	].join('\n'));
	// move the input to keep form validation working
	this.node = input.nextSibling;
	this.list = this.node.nextSibling;
	this.list.addEventListener('click', function(e) {
		if (e.target.closest('a')) e.preventDefault();
	}, true);
	var button = this.node.querySelector('.button');
	var icon = this.icon = button.querySelector('.icon');

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
			me.search.value = e.key;
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
	button.addEventListener('click', function() {
		if (icon.classList.contains('add')) {
			me.upload().then(function(files) {
				if (!files) return;
				var p = Promise.resolve();
				files.forEach(function(file) {
					p = p.then(function() {
						return me.add(file);
					});
				});
			});
		} else if (icon.classList.contains('remove')) {
			me.clear();
			if (me.searching) {
				me.searchStop();
			}
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

		Array.from(this.list.querySelectorAll('.item')).forEach(function(item) {
			item.classList.remove('selected');
		});
		item.classList.add('selected');
		input.value = href;
		var event = document.createEvent('Event');
		event.initEvent('change', true, true);
		input.dispatchEvent(event);
	}.bind(this));

	// initialize
	if (input.value) {
		this.set(input.value);
	}
}

Href.prototype.searchStart = function() {
	this.searching = true;
	document.querySelector('#pageboard-write').classList.add('href');
	this.node.closest('.field').classList.add('href');
	this.node.classList.add('left');
	this.node.classList.add('icon');
	this.node.insertAdjacentHTML('afterBegin', '<i class="search icon"></i>');
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
	this.node.querySelector('.search.icon').remove();
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
	});
};

Href.prototype.uploading = function() {
	var str = '<div class="ui attached progress"><div class="bar"></div></div>';
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

Href.prototype.set = function(val) {
	if (val == null || val == "") return this.clear();
	this.input.value = val;
	this.icon.classList.remove('add');
	this.icon.classList.add('remove');
	var query = {};
	if (val[0] == '/' || /^https?:\/\//.test(val)) query.url = val;
	else query.text = val;
	this.list.textContent = "";
	return this.uiLoad(GET('/api/href', query)).then(this.show);
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
	classList.remove('error');
	return p.catch(function(err) {
		classList.remove('loading');
		classList.add('error');
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
	}
	var list = this.list;
	if (clear) list.textContent = "";
	results.forEach(function(obj) {
		var item = document.createElement('a');
		item.className = 'item';
		if (obj.meta.description) item.title = obj.meta.description;
		item.setAttribute('href', obj.url);
		var content = document.createElement('div');
		content.className = 'content';
		content.innerHTML = '<div class="ui tiny header"></div>';
		content.firstChild.textContent = obj.title;
		content.firstChild.insertAdjacentHTML('beforeEnd', [
			'<div class="ui right floated tiny compact black circular icon button" data-action="remove">',
			'<i class="icon close"></i>',
			'</div>'
		].join('\n'));
		item.appendChild(content);
		if (obj.icon) {
			var img = document.createElement('img');
			img.className = 'ui avatar icon image';
			img.src = obj.icon;
			content.firstChild.insertBefore(img, content.firstChild.firstChild);
		}

		var meta = document.createElement('div');
		meta.className = 'meta';
		meta.textContent = obj.mime;
		meta.appendChild(document.createElement('br'));
		if (obj.type == "video" || obj.type == "image") {
			if (obj.meta.width) {
				meta.appendChild(document.createTextNode(obj.meta.width + 'w'));
			}
			if (obj.meta.height) {
				meta.appendChild(document.createTextNode(" " + obj.meta.height + 'h'));
			}
		}
		if (obj.meta.duration) {
			meta.appendChild(document.createTextNode(" - " + obj.meta.duration));
		}
		if (meta.lastChild.nodeName != "BR") meta.appendChild(document.createElement('br'));
		meta.appendChild(document.createTextNode(moment(obj.updated_at).fromNow()));
		if (obj.meta.thumbnail) {
			var img = document.createElement('img');
			img.src = obj.meta.thumbnail;
			img.className = 'ui tiny right floated image';
			meta.insertBefore(img, meta.firstChild);
		}
		content.appendChild(meta);
		list.appendChild(item);
	});
};

Href.prototype.destroy = function() {
	document.querySelector('#pageboard-write').classList.remove('href');
};

})(window.Pageboard);

