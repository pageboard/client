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
		var cursor = doc.head.querySelector(`${node.tagName}:nth-last-child(1)`);
		doc.head.insertBefore(node, cursor && cursor.nextElementSibling || null);
		if (!live) resolve();
	});
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

