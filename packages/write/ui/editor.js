Page.setup(state => {
	const it = window.parent.Pageboard;
	if (!it || !it.adopt || !state.data.item) return;
	state.finish(() => {
		it.adopt(window, state);
	});
});

Page.patch(state => {
	const it = window.parent.Pageboard;
	state.push = function(url, opts) {
		if (it.editor && !it.editor.closed) return Promise.resolve();
		return Object.getPrototypeOf(this).push.call(this, url, opts);
	};
	state.replace = function(url, opts) {
		return Object.getPrototypeOf(this).replace.call(this, url, opts);
	};
});

