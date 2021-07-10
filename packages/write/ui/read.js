Page.setup(function(state) {
	const it = window.parent.Pageboard;
	if (!it || !it.adopt || !state.data.$cache) return;
	state.finish(() => {
		it.adopt(window, state);
	});
});

Page.patch(function(state) {
	const it = window.parent.Pageboard;
	state.push = function(url, opts) {
		const active = it.editor && !it.editor.closed;
		if (active) return Promise.resolve();
		const obj = typeof url == "string" ? Page.parse(url) : url;
		if (!obj.query) obj.query = {};
		obj.query.develop = this.query.develop;
		return Object.getPrototypeOf(this).push.call(this, obj, opts);
	};
	state.replace = function(url, opts) {
		const obj = typeof url == "string" ? Page.parse(url) : url;
		if (!obj.query) obj.query = {};
		obj.query.develop = this.query.develop;
		return Object.getPrototypeOf(this).replace.call(this, obj, opts);
	};
});
