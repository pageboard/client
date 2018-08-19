Page.route(function(state) {
	return Pageboard.build({
		state: state,
		pathname: '/.api/page',
		query: {
			url: state.pathname,
			develop: state.query.develop
		}
	}).then(function(node) {
		if (!node || node.nodeName != "HTML") {
			throw new Error("page render should return an html element");
		}
		state.document = node.ownerDocument;
	});
});
