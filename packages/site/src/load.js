function load(node, head) {
	const live = node.ownerDocument == document;
	return new Promise((resolve, reject) => {
		if (live) {
			node.addEventListener('load', resolve);
			node.addEventListener('error', () => {
				const err = new Error(`Cannot load ${node.src || node.href}`);
				err.code = 404;
				reject(err);
			});
		}
		const cursel = node.tagName == "LINK" ? 'script' : 'script:nth-last-child(1) + *';
		const cursor = head.querySelector(cursel);
		head.insertBefore(node, cursor);
		if (!live) resolve();
	});
}

export function meta(meta) {
	let pr = Promise.resolve();
	if (!meta) return pr;
	if (meta.elements) for (const [name, el] of Object.entries(meta.elements)) {
		if (!Pageboard.elements[name]) Pageboard.elements[name] = el;
	}
	if (meta.schemas) meta.schemas.forEach(schema => {
		if (Pageboard.cache[schema]) return;
		pr = Pageboard.cache[schema] = Pageboard.load.js(schema);
	});

	// additional resources - elements in group page usually do not have those
	if (meta.stylesheets) pr = pr.then(() => {
		return Promise.all(meta.stylesheets.map((url) => {
			return Pageboard.load.css(url);
		}));
	});
	if (meta.scripts) pr = pr.then(() => {
		return Promise.all(meta.scripts.map((url) => {
			return Pageboard.load.js(url);
		}));
	});

	return pr;
}

function getHead(doc) {
	if (!doc) doc = document;
	else if (doc.$element) doc = doc.$element.dom;
	return doc.querySelector('head');
}

export function js(url, doc) {
	const head = getHead(doc);
	doc = head.ownerDocument;
	if (head.querySelector(`script[src="${url}"]`)) {
		return Promise.resolve();
	}
	const node = doc.createElement('script');
	node.async = false;
	node.defer = true;
	node.src = url;
	return load(node, head);
}

export function css(url, doc) {
	const head = getHead(doc);
	doc = head.ownerDocument;
	if (head.querySelector(`link[rel="stylesheet"][href="${url}"]`)) {
		return Promise.resolve();
	}
	const node = doc.createElement('link');
	node.rel = "stylesheet";
	node.href = url;
	return load(node, head);
}
