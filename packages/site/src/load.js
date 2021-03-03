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

exports.meta = function(meta) {
	var pr = Promise.resolve();
	if (!meta) return pr;
	if (meta.elements) Object.entries(meta.elements).forEach(function([name, el]) {
		if (!Pageboard.elements[name]) Pageboard.elements[name] = el;
	});
	if (meta.bundle && !Pageboard.cache[meta.bundle]) {
		pr = Pageboard.cache[meta.bundle] = Pageboard.load.js(meta.bundle);
	}

	// additional resources - elements in group page usually do not have those
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

	return pr;
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
	node.async = false;
	node.defer = true;
	node.src = url;
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

