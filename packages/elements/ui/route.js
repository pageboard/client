Page.route(function(state) {
	return Pageboard.build({
		state: state,
		pathname: '/.api/page',
		query: {
			url: state.pathname,
			develop: state.query.develop
		}
	}).then(function(node) {
		if (!node || node.nodeName != "BODY") {
			throw new Error("page render should return a body element");
		}
		var doc = node.ownerDocument;
		doc.replaceChild(node.parentNode, doc.documentElement);
		state.document = doc;
	});
});
