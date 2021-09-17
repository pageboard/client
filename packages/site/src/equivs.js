export function write(obj) {
	const head = document.head;
	let meta = document.head.querySelector('meta');
	for (const [name, content] of Object.entries(obj)) {
		let node = head.querySelector(`meta[http-equiv="${name}"]`);
		if (content == null) {
			if (node) {
				node.remove();
			}
		} else {
			if (!node) {
				node = head.dom(`<meta http-equiv="${name}">`);
				head.insertBefore(node, meta ? meta.nextElementSibling : null);
			}
			meta = node;
			node.content = content;
		}
	}
}

export function read() {
	const obj = {};
	for (const node of document.head.querySelectorAll('meta[http-equiv]')) {
		obj[node.httpEquiv] = node.content;
	}
	return obj;
}
