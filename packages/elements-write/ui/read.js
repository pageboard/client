Page.setup(function(state) {
	var it = window.parent.Pageboard;
	if (!it || !state.data.$cache) return;
	if (it.adopt) it.adopt(window, state);
});
