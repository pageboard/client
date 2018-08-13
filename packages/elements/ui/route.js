Page.route(function(state) {
	return Pageboard.build('/.api/page', {
		url: state.pathname,
		develop: state.query.develop
	}).then(function(node) {
		if (!node || node.nodeName != "HTML") {
			throw new Error("page render should return an html element");
		}
		var doc = node.ownerDocument;
		state.document = doc;

		if (window.parent.Pageboard && window.parent.Pageboard.write) {
			// FIXME find a better way for write element to insert js/css before page is handed to Page
			scope.$write = true;
			window.parent.Pageboard.install(doc, page);
		}
	});
});
