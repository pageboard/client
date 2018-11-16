Page.route(function(state) {
	var loader;
	if (state.$data) {
		loader = Promise.resolve(state.$data);
	} else {
		loader = Pageboard.fetch('get', '/.api/page', {
			url: state.pathname,
			develop: state.query.develop
		});
	}

	return Pageboard.bundle(loader, state.scope).then(function(res) {
		state.$data = res;
		var node = Pageboard.render(res, state.scope);
		if (!node || node.nodeName != "BODY") {
			throw new Error("page render should return a body element");
		}
		var doc = node.ownerDocument;
		doc.replaceChild(node.parentNode, doc.documentElement);
		return doc;
	});
});
