Page.setup(function(state) {
	const it = window.parent.Pageboard;
	if (!it || !it.adopt || !state.data.$cache) return;
	state.finish(() => {
		it.adopt(window, state);
	});
});

Page.patch(function(state) {
	const it = window.parent.Pageboard;
	function fixLoc(url) {
		const loc = typeof url == "string" ? Page.parse(url) : url;
		if (!loc.query) loc.query = {};
		loc.query.develop = this.query.develop;
		return loc;
	}
	state.push = function(url, opts) {
		if (!it.editor?.closed) return Promise.resolve();
		return Object.getPrototypeOf(this).push.call(this, fixLoc(url), opts);
	};
	state.replace = function(url, opts) {
		return Object.getPrototypeOf(this).replace.call(this, fixLoc(url), opts);
	};
});
