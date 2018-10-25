function load(node, head, url) {
	var doc = node.ownerDocument;
	var live = doc == document;
	return new Promise(function(resolve, reject) {
		if (live) {
			node.addEventListener('load', function() {
				resolve();
			});
			node.addEventListener('error', function() {
				var err = new Error(`Cannot load ${url}`);
				err.code = 404;
				reject(err);
			});
		}
		var cursel = node.tagName == "LINK" ? 'script' : 'script:nth-last-child(1) + *';
		var cursor = doc.head.querySelector(cursel);
		doc.head.insertBefore(node, cursor);
		if (!live) resolve();
	});
}

var cache = {};

exports.meta = function(meta) {
	if (!meta || !meta.elements) return Promise.resolve();
	if (!cache[meta.elements]) {
		cache[meta.elements] = Pageboard.load.js(meta.elements);
	}
	if (meta.group != "page") {
		// standalone resources are imported after page has been imported by router
		if (meta.stylesheets) meta.stylesheets.forEach(function(url) {
			Pageboard.load.css(url);
		});
		if (meta.scripts) meta.scripts.forEach(function(url) {
			Pageboard.load.js(url);
		});
	}
	return cache[meta.elements];
};

exports.js = function(url, doc) {
	if (!doc) doc = document;
	if (doc.head.querySelector(`script[src="${url}"]`)) {
		return Promise.resolve();
	}
	var node = doc.createElement('script');
	node.src = url;
	node.defer = true;
	return load(node, url);
};

exports.css = function(url, doc) {
	if (!doc) doc = document;
	if (doc.head.querySelector(`link[rel="stylesheet"][href="${url}"]`)) {
		return Promise.resolve();
	}
	var node = doc.createElement('link');
	node.rel = "stylesheet";
	node.href = url;
	return load(node, url);
};

