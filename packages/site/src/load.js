import { Deferred } from 'class-deferred';

function load(node, head) {
	const d = new Deferred();
	const live = node.ownerDocument == document;
	if (live) {
		node.addEventListener('load', d.resolve);
		node.addEventListener('error', () => {
			const err = new Error(`Cannot load ${node.src || node.href}`);
			err.code = 404;
			d.reject(err);
		});
	}
	const cursel = node.tagName == "LINK" ? 'script' : 'script:nth-last-child(1) + *';
	const cursor = head.querySelector(cursel);
	head.insertBefore(node, cursor);
	if (!live) d.resolve();
	return d;
}

export async function meta(state, meta) {
	if (!meta) return;
	if (meta.elements) for (const [name, el] of Object.entries(meta.elements)) {
		if (!Pageboard.elements[name]) Pageboard.elements[name] = el;
	}
	if (meta.schemas) await Promise.all(meta.schemas.map(schema => {
		if (!Pageboard.cache[schema]) {
			Pageboard.cache[schema] = Pageboard.load.js(schema);
		}
		return Pageboard.cache[schema];
	}));

	// additional resources - elements in group page usually do not have those
	if (meta.scripts) await Promise.all(
		meta.scripts.map(url => Pageboard.load.js(url))
	);
	// cannot wait for these
	if (meta.stylesheets) {
		state.setup(() => Promise.all(
			meta.stylesheets.map(url => Pageboard.load.css(url))
		));
	}
}

function getHead(scope) {
	const doc = scope?.$element?.dom ?? document;
	return doc.querySelector('head') || document.head;
}

export async function js(url, scope) {
	const head = getHead(scope);
	const doc = head.ownerDocument;
	if (head.querySelector(`script[src="${url}"]`)) {
		return;
	}
	const node = doc.createElement('script');
	node.async = false;
	node.defer = true;
	node.src = url;
	return load(node, head);
}

export async function css(url, scope) {
	const head = getHead(scope);
	const doc = head.ownerDocument;
	if (head.querySelector(`link[rel="stylesheet"][href="${url}"]`)) {
		return;
	}
	const node = doc.createElement('link');
	node.rel = "stylesheet";
	node.href = url;
	return load(node, head);
}
