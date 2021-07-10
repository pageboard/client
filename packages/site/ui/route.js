Page.route(function(state) {
	let loader;
	if (state.data.$cache) {
		loader = Promise.resolve(state.data.$cache);
	} else {
		loader = Pageboard.fetch('get', '/.api/page', {
			url: state.pathname.replace(/\.\w+$/, ''),
			develop: state.query.develop
		});
	}

	return Pageboard.bundle(loader, state).then(function(res) {
		state.data.$cache = res;
		state.scope.$page = res.item;
		const node = Pageboard.render(res, state.scope);
		if (!node || node.nodeName != "BODY") {
			throw new Error("page render should return a body element");
		}
		const doc = node.ownerDocument;
		doc.replaceChild(node.parentNode, doc.documentElement);
		return doc;
	});
});
