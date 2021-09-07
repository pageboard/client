export function write(obj) {
	const head = document.head;
	let meta = document.head.querySelector('meta');
	Object.entries(obj).forEach(([name, content]) => {
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
	});
}

export function read() {
	const list = document.head.querySelectorAll('meta[http-equiv]');
	const obj = {};
	list.forEach(node => {
		obj[node.httpEquiv] = node.content;
	});
	return obj;
}
