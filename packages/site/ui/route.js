Page.route(async state => {
	const res = state.scope.$cache ?? await Pageboard.fetch('get', '/.api/page', {
		url: state.pathname.replace(/\.\w+$/, ''),
		nested: window.parent != window ? 1 : undefined
	});
	await Pageboard.bundle(state, res);
	state.scope.$cache = res;
	state.scope.$page = res.item;
	const node = Pageboard.render(res, state.scope);
	if (!node || node.nodeName != "BODY") {
		throw new Error("page render should return a body element");
	}
	const doc = node.ownerDocument;
	doc.replaceChild(node.parentNode, doc.documentElement);
	return doc;
});
