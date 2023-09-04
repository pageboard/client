Page.setup(state => {
	const p = window.parent;
	if (p != window && state.data.page?.item) state.finish(() => {
		p.Pageboard?.adopt?.(window, state);
	});
});

Page.patch(state => {
	const p = window.parent;
	state.push = function (url, opts) {
		if (p.Pageboard.editor && !p.Pageboard.editor.closed) return Promise.resolve();
		return Object.getPrototypeOf(this).push.call(this, url, opts);
	};
});
