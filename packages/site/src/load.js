import { Deferred } from 'class-deferred';

const cache = new Map();

function load(node, head, priority = 0) {
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
	// insert after nodes with < priority, or before nodes with > priority
	if (priority) node.dataset.priority = priority;
	const nodes = head.querySelectorAll(node.tagName);
	let cursor = Array.from(nodes).find(inode => {
		const p = parseInt(inode.dataset.priority) || 0;
		return p >= priority;
	});
	if (!cursor && node.tagName == "LINK") cursor = head.querySelector('script');
	head.insertBefore(node, cursor);
	if (!live) d.resolve();
	return d;
}

export async function schemas(scope, list) {
	if (list) await Promise.all(list.map(schema => {
		if (!cache.has(schema)) {
			cache.set(schema, js(schema, scope.$doc));
		}
		return cache.get(schema);
	}));
}

export async function bundles(state, meta = {}) {
	const { scripts, stylesheets } = meta;
	if (scripts) await Promise.all(
		scripts.map(url => js(url, state.doc, meta.priority))
	);
	// cannot wait for these
	if (stylesheets) {
		state.setup(state => Promise.all(
			stylesheets.map(url => css(url, state.doc, meta.priority))
		));
	}
}

function getHead(doc) {
	return doc.head ?? doc.querySelector('head');
}

export async function js(url, doc = document, priority = 0) {
	const head = getHead(doc);
	if (head.querySelector(`script[src="${url}"]`)) {
		return;
	}
	const node = doc.createElement('script');
	node.async = false;
	node.defer = true;
	node.src = url;
	return load(node, head, priority);
}

export async function css(url, doc = document, priority = 0) {
	const head = getHead(doc);
	if (head.querySelector(`link[rel="stylesheet"][href="${url}"]`)) {
		return;
	}
	const node = doc.createElement('link');
	node.rel = "stylesheet";
	node.href = url;
	return load(node, head, priority);
}
