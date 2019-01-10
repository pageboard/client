function load(node, head) {
	var live = node.ownerDocument == document;
	return new Promise(function(resolve, reject) {
		if (live) {
			node.addEventListener('load', function() {
				resolve();
			});
			node.addEventListener('error', function() {
				var err = new Error(`Cannot load ${node.src || node.href}`);
				err.code = 404;
				reject(err);
			});
		}
		var cursel = node.tagName == "LINK" ? 'script' : 'script:nth-last-child(1) + *';
		var cursor = head.querySelector(cursel);
		head.insertBefore(node, cursor);
		if (!live) resolve();
	});
}

var cache = {};

exports.meta = function(meta) {
	if (!meta || !meta.elements) return Promise.resolve();
	if (!cache[meta.elements]) {
		cache[meta.elements] = Pageboard.load.js(meta.elements);
	}
	var pr = Promise.resolve();
	if (meta.group != "page") {
		// standalone resources are imported after page has been imported by router
		if (meta.stylesheets) pr = pr.then(function() {
			return Promise.all(meta.stylesheets.map(function(url) {
				return Pageboard.load.css(url);
			}));
		});
		if (meta.scripts) pr = pr.then(function() {
			return Promise.all(meta.scripts.map(function(url) {
				return Pageboard.load.js(url);
			}));
		});
	}
	return cache[meta.elements].then(function() {
		return pr;
	});
};

function getHead(doc) {
	if (!doc) doc = document;
	else if (doc.$element) doc = doc.$element.dom;
	return doc.querySelector('head');
}

exports.js = function(url, doc) {
	var head = getHead(doc);
	doc = head.ownerDocument;
	if (head.querySelector(`script[src="${url}"]`)) {
		return Promise.resolve();
	}
	var node = doc.createElement('script');
	node.src = url;
	node.defer = true;
	return load(node, head);
};

exports.css = function(url, doc) {
	var head = getHead(doc);
	doc = head.ownerDocument;
	if (head.querySelector(`link[rel="stylesheet"][href="${url}"]`)) {
		return Promise.resolve();
	}
	var node = doc.createElement('link');
	node.rel = "stylesheet";
	node.href = url;
	return load(node, head);
};

