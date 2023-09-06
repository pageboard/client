import { Deferred } from 'class-deferred';

function load(node, head, priority = 0) {
	const d = new Deferred();
	const isLink = node.tagName == "LINK";
	const live = node.ownerDocument == document && !(isLink && document.hidden);
	if (live) {
		node.addEventListener('load', d.resolve);
		node.addEventListener('error', () => {
			const err = new Error(`Cannot load ${node.src || node.href}`);
			err.code = 404;
			d.reject(err);
		});
	}
	if (priority) node.dataset.priority = priority;
	const nodes = head.querySelectorAll(isLink ? 'link[rel="stylesheet"]' : 'script');
	let cursor = Array.from(nodes).find(inode => {
		const p = parseInt(inode.dataset.priority) || 0;
		return p > priority;
	});
	if (!cursor && isLink) cursor = head.querySelector('script');
	head.insertBefore(node, cursor);
	if (!live) d.resolve();
	return d;
}

export async function bundle(state, { scripts, stylesheets, priority }) {
	if (stylesheets) await Promise.allSettled(
		Array.from(stylesheets).map(url => css(url, state.doc, priority))
	);
	if (scripts) await Promise.allSettled(
		Array.from(scripts).map(url => js(url, state.doc, priority))
	);
}

function getHead(doc) {
	return doc.head ?? doc.querySelector('head') ?? document.head;
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
