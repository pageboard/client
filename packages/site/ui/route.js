Page.route(async state => {
	if (!Object.keys(state.data).length) {
		state.data = await Pageboard.fetch('get', '/.api/page', {
			url: state.pathname.replace(/\.\w+$/, ''),
			nested: window.parent != window ? 1 : undefined
		});
	}
	await Pageboard.bundle(state, state.data);
	state.scope.$page = state.data.item;
	const node = Pageboard.render(state.data, state.scope);
	if (!node || node.nodeName != "BODY") {
		throw new Error("page render should return a body element");
	}
	const doc = node.ownerDocument;
	doc.replaceChild(node.parentNode, doc.documentElement);
	return doc;
});
