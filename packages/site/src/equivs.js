module.exports = function(obj) {
	const head = document.head;
	let meta = document.head.querySelector('meta');
	Object.entries(obj).forEach(([name, content]) => {
		let node = head.querySelector(`meta[http-equiv="${name}"]`);
		if (!node) {
			node = head.dom(`<meta http-equiv="${name}">`);
			head.insertBefore(node, meta ? meta.nextElementSibling : null);
		}
		meta = node;
		node.content = content;
	});
};
