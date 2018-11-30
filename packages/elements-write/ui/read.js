Page.setup(function(state) {
	var it = window.parent.Pageboard;
	if (!it) return;
	if (it.adopt) it.adopt(window, state);
});
